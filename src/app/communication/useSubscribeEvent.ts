import {ConnectionState, stompClient} from "@/app/communication/broadcast";
import {useEffect, useState} from "react";
import {Client} from "@stomp/stompjs";
import {unsubscribe} from "node:diagnostics_channel";

let isActivated = false

function useBroadcast() {
    const [state, setState] = useState<ConnectionState>("disconnected")

    useEffect(() => {
        const unsubscribe = stompClient.onConnectionChange(setState)
        return () => unsubscribe()
    }, []);


    return  { state, stompClient }
}

export { useBroadcast }