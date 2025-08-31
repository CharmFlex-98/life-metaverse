import {ConnectionState, createStompClient, StompClient, StompClientConfig} from "@/app/communication/broadcast";
import {useEffect, useMemo, useRef, useState} from "react";
import {useConfigProvider} from "@/app/ConfigProvider";

function useBroadcast() {
    const [state, setState] = useState<ConnectionState>("disconnected")
    const stompClientRef = useRef<StompClient | null>(null);
    const configProvider = useConfigProvider();
    

    if (!stompClientRef.current) {
        console.log("baseUrl:: " + configProvider.baseUrl)
        console.log("Creating stomp client...")
        stompClientRef.current = createStompClient({ baseUrl: configProvider.baseUrl} )
    }

    useEffect(() => {
        const stompClient = stompClientRef.current!
        const unsubscribe = stompClient.onConnectionChange(setState)
        return () => unsubscribe()
    }, []);


    return  { state, stompClient: stompClientRef.current }
}

export { useBroadcast }