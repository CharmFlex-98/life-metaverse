// app/communication/stomp-client.ts
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import {JsonValue} from "@/app/core/utils";
import {useConfigProvider} from "@/app/ConfigProvider";

export type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

interface StompClient {
    client: Client;
    init: (baseUrl: string) => void;
    subscribe: (topic: string, callback: (message: IMessage) => void) => () => void;
    publish: (destination: string, body: unknown) => boolean;
    connect: () => void;
    disconnect: () => void;
    onConnectionChange: (listener: (state: ConnectionState) => void) => () => void;
}

let clientInstance: Client | null = null;
let _baseUrl: string | undefined = undefined;
let connectionState: ConnectionState = "disconnected";
const connectionListeners: Set<(state: ConnectionState) => void> = new Set();
let pendingSubscriptions: { topic: string; cb: (msg: IMessage) => void }[] = []; // ✅ queue

const updateConnectionState = (newState: ConnectionState) => {
    connectionState = newState;
    connectionListeners.forEach((listener) => listener(newState));
};

const createStompClient = (): StompClient => {
    const initializeClient = (): Client => {
        if (clientInstance) return clientInstance;

        clientInstance = new Client({
            brokerURL: _baseUrl ? `wss://${_baseUrl}/ws-avatar` : "ws://localhost:8081/ws-avatar",
            reconnectDelay: 5000,
            debug: (str) => console.log("STOMP:", str),
        });

        clientInstance.onConnect = (frame) => {
            console.log("Connected!", frame);
            updateConnectionState("connected");

            // ✅ flush queued subscriptions
            pendingSubscriptions.forEach(({ topic, cb }) => {
                clientInstance?.subscribe(topic, cb);
            });
            pendingSubscriptions = [];
        };

        clientInstance.onStompError = (frame) => {
            console.error("STOMP Error:", frame.headers["message"], frame.body);
            updateConnectionState("error");
        };

        clientInstance.onWebSocketError = (event) => {
            console.error("WebSocket error:", event);
            updateConnectionState("error");
        };

        clientInstance.onDisconnect = () => {
            console.log("Disconnected");
            updateConnectionState("disconnected");
        };

        return clientInstance;
    };

    const init = (baseUrl: string) => {
        _baseUrl = baseUrl;
    }

    const subscribe = (topic: string, callback: (message: IMessage) => void): () => void => {
        const client = initializeClient();

        if (connectionState !== "connected") {
            // ✅ queue until connected
            pendingSubscriptions.push({ topic, cb: callback });
            return () => {
                pendingSubscriptions = pendingSubscriptions.filter((s) => s.cb !== callback);
            };
        }

        const subscription: StompSubscription = client.subscribe(topic, callback);
        return () => subscription.unsubscribe();
    };

    const publish = (destination: string, body: unknown): boolean => {
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
    };

    const connect = () => {
        const client = initializeClient();
        if (connectionState === "disconnected") {
            updateConnectionState("connecting");
            client.activate();
        }
    };

    const disconnect = () => {
        if (clientInstance) {
            clientInstance.deactivate();
            clientInstance = null;
            updateConnectionState("disconnected");
        }
    };

    const onConnectionChange = (listener: (state: ConnectionState) => void): (() => void) => {
        connectionListeners.add(listener);
        return () => connectionListeners.delete(listener);
    };

    // auto-connect
    connect();

    return {
        client: initializeClient(),
        init,
        subscribe,
        publish,
        connect,
        disconnect,
        onConnectionChange,
    };
};

export const stompClient = createStompClient();
