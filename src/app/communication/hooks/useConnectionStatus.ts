import {useEffect, useState} from "react";
import {BroadcastMetaDataEventResponse} from "@/app/avatar/types";
import {useWebSocketService} from "@/app/communication/broadcast";

function useConnectionStatus() {
    const { connectionState: state, subscribe } = useWebSocketService()
    const [onlineCount, setOnlineCount] = useState(0)

    // Subscribe to online count
    useEffect(() => {
        const unsubscribe = subscribe('/topic/session_metadata', (message) => {
            if (message.body) {
                const res = JSON.parse(message.body) as BroadcastMetaDataEventResponse
                const count = Number(res.onlineCount)
                if (!isNaN(count)) {
                    setOnlineCount(count)
                }
            }
        })

        return () => unsubscribe()
    }, [subscribe])

    return {
        connectionState: state,
        onlineCount,
        isConnected: state === 'connected'
    }
}

export { useConnectionStatus }