import {ConnectionState, stompClient} from "@/app/communication/broadcast";
import {useEffect, useState} from "react";
import {useConfigProvider} from "@/app/ConfigProvider";

function useBroadcast() {
    const [state, setState] = useState<ConnectionState>("disconnected")
    const configProvider = useConfigProvider();
    useEffect(() => {
        stompClient.init(configProvider.baseUrl)
        const unsubscribe = stompClient.onConnectionChange(setState)
        return () => unsubscribe()
    }, []);


    return  { state, stompClient }
}

export { useBroadcast }