import {ConnectionState, stompClient} from "@/app/communication/websocketClient";
import {useEffect, useMemo, useState} from "react";
import {useConfigProvider} from "@/app/ConfigProvider";

function useBroadcast() {
    const [state, setState] = useState<ConnectionState>("disconnected")
    const config = useConfigProvider()
    const wsClient = useMemo(() => {
        return stompClient(config.baseUrl)
    }, [])

    useEffect(() => {
        setState(wsClient.getCurrentConnection)
        const unsubscribe = wsClient.onConnectionChange(setState)
        return () => unsubscribe()
    }, [wsClient]);


    return  { state, wsClient }
}

export { useBroadcast }