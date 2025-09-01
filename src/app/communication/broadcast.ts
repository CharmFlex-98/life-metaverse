// app/communication/stomp-client.ts
import {Client, IMessage, StompSubscription} from "@stomp/stompjs";
import {useConfigProvider} from "@/app/ConfigProvider";
import {DEFAULT_DOMAIN_URL} from "@/app/avatar/constants";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";

export type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

export interface WebSocketService {
    connectionState: ConnectionState;
    subscribe: (topic: string, callback: (message: IMessage) => void) => () => void;
    publish: (destination: string, body: unknown) => boolean;
}


interface Subscription {
    topic: string
    callback: (message: IMessage) => void
}

const useWebSocketService = (): WebSocketService => {
    const clientRef = useRef<Client | null>(null)
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const pendingSubscriptionsRef = useRef<Subscription[]>([]); // ✅ queue
    const stompClientConfig = useConfigProvider()

    const createClient = useCallback(() => {
        console.log("creating client...")

        const newClient = new Client({
            brokerURL: stompClientConfig.baseUrl ? `wss://${stompClientConfig.baseUrl}/api/ws-avatar` : `ws://${DEFAULT_DOMAIN_URL}/api/ws-avatar`,
            reconnectDelay: 5000,
            debug: (str) => console.log("STOMP::", str),
        });

        newClient.onConnect = (frame) => {
            console.log("Connected!", frame);
            setConnectionState("connected");

            // ✅ flush queued subscriptions
            const pendingSubscriptions = pendingSubscriptionsRef.current
            pendingSubscriptions.forEach(({ topic, callback }) => {
                newClient?.subscribe(topic, callback);
            });
            pendingSubscriptionsRef.current = [];
        };

        newClient.onStompError = (frame) => {
            console.error("STOMP Error:", frame.headers["message"], frame.body);
            setConnectionState("error");
        };

        newClient.onWebSocketError = (event) => {
            console.error("WebSocket error:", event);
            setConnectionState("error");
        };

        newClient.onDisconnect = () => {
            console.log("Disconnected");
            setConnectionState("disconnected");
        };

        newClient.onWebSocketClose = (event) => {
            console.log("Web Socket Closed");
            setConnectionState("disconnected");
        }

        console.log("✅Completed creating client")

        newClient.activate()
        clientRef.current = newClient;

        return newClient
    }, [stompClientConfig.baseUrl])

    useEffect(() => {
        clientRef.current = null
        const client = createClient()

        return () => {
            client.deactivate().then(() => {
                console.log("Client is destroyed.");
            })
            setConnectionState("disconnected");
        }
    }, [createClient])


    const subscribe = useCallback((topic: string, callback: (message: IMessage) => void): () => void => {
        const client = clientRef.current;

        if (!client || connectionState !== "connected") {
            // ✅ queue until connected
            const pendingSubscriptions = pendingSubscriptionsRef.current;
            pendingSubscriptions.push({ topic, callback: callback });
            return () => {
                pendingSubscriptionsRef.current = pendingSubscriptions.filter((s) => s.callback !== callback);
            };
        }

        const subscription: StompSubscription = client.subscribe(topic, callback);
        return () => subscription.unsubscribe();
    }, [createClient]);

    const publish = useCallback((destination: string, body: unknown): boolean => {
        const clientInstance = clientRef.current;

        if (!clientInstance || connectionState !== "connected") {
            console.warn("Cannot publish - client not connected");
            return false;
        }
        try {
            clientInstance.publish({ destination, body: JSON.stringify(body) });
            return true;
        } catch (error) {
            console.error("Failed to publish message:", error);
            return false;
        }
    }, [createClient]);


    return {
        connectionState,
        subscribe,
        publish,
    };
};

export { useWebSocketService };
