import {ConnectionState, stompClient} from "@/app/communication/broadcast";
import {useEffect, useState} from "react";

function useBroadcast() {
    const [state, setState] = useState<ConnectionState>("disconnected")

    useEffect(() => {
        const unsubscribe = stompClient.onConnectionChange(setState)
        return () => unsubscribe()
    }, []);


    return  { state, stompClient }
}

export { useBroadcast }