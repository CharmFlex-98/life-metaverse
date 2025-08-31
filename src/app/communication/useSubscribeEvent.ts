import {ConnectionState, createStompClient } from "@/app/communication/broadcast";
import {useEffect, useMemo, useState} from "react";
import {useConfigProvider} from "@/app/ConfigProvider";

function useBroadcast() {
    const [state, setState] = useState<ConnectionState>("disconnected")
    const configProvider = useConfigProvider();
    const stompClient = useMemo(() => {
        return createStompClient({ baseUrl: configProvider.baseUrl} )
    }, [configProvider.baseUrl])
    useEffect(() => {
        const unsubscribe = stompClient.onConnectionChange(setState)
        return () => unsubscribe()
    }, [stompClient]);


    return  { state, stompClient }
}

export { useBroadcast }