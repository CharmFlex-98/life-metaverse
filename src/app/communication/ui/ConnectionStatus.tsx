// components/connection/ConnectionStatus.tsx
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useEffect, useState } from "react"
import { ConnectionState } from "@/app/communication/broadcast"
import { motion } from "framer-motion"

interface ConnectionStatusProps {
    connectionState: ConnectionState
    onlineCount: number
    className?: string
}

export function ConnectionStatus({ connectionState, onlineCount, className }: ConnectionStatusProps) {
    const [prevConnectionState, setPrevConnectionState] = useState(connectionState)

    useEffect(() => {
        if (prevConnectionState !== connectionState) {
            if (connectionState === 'connected' && ['disconnected', 'error'].includes(prevConnectionState)) {
                toast.success('Connected to server', { description: 'You are now online', duration: 3000 })
            } else if (['error', 'disconnected'].includes(connectionState) && prevConnectionState === 'connected') {
                toast.error('Connection lost', { description: 'Attempting to reconnect...', duration: 5000 })
            }
            setPrevConnectionState(connectionState)
        }
    }, [connectionState, prevConnectionState])

    const getStatusConfig = () => {
        switch (connectionState) {
            case 'connected':
                return { color: 'bg-green-500', text: 'Connected', badgeVariant: 'default' as const, pulseColor: 'bg-green-400' }
            case 'connecting':
                return { color: 'bg-yellow-400', text: 'Connecting...', badgeVariant: 'secondary' as const, pulseColor: 'bg-yellow-500' }
            case 'disconnected':
                return { color: 'bg-red-500', text: 'Disconnected', badgeVariant: 'destructive' as const, pulseColor: 'bg-red-400' }
            case 'error':
                return { color: 'bg-red-600', text: 'Connection failed', badgeVariant: 'destructive' as const, pulseColor: 'bg-red-500' }
        }
    }

    const status = getStatusConfig()

    return (
        <div className={cn(
            'flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 p-3 bg-gray-800 rounded-xl shadow-lg',
            className
        )}>

            {/* Status indicator */}
            <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                    {/* Solid status dot */}
                    <div className={cn('w-4 h-4 rounded-full', status.color, connectionState === 'connecting' && 'animate-pulse')} />

                    {/* Animated pulse for connected */}
                    {connectionState === 'connected' && (
                        <motion.div
                            className={cn('absolute inset-0 w-4 h-4 rounded-full opacity-30', status.pulseColor)}
                            animate={{ scale: [1, 1.8, 1] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                        />
                    )}
                </div>
                <Badge variant={status.badgeVariant} className="text-sm font-semibold text-gray-50">
                    {status.text}
                </Badge>
            </div>

            {/* Online count */}
            <div className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                <span className="font-semibold text-gray-50">{onlineCount}</span>
                <span className="text-gray-400">online</span>
            </div>
        </div>
    )
}
