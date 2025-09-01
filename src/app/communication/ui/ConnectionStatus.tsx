import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useEffect, useState } from "react"
import { ConnectionState } from "@/app/communication/broadcast"
import { motion, AnimatePresence } from "framer-motion"
import { Link, Link2Off, Zap, Users, Wifi, WifiOff, Sparkles, Heart, Radio } from "lucide-react"

interface ConnectionStatusProps {
    connectionState: ConnectionState
    onlineCount: number
    className?: string
}

export function ConnectionStatus({ connectionState, onlineCount, className }: ConnectionStatusProps) {
    const [prevConnectionState, setPrevConnectionState] = useState(connectionState)
    const [showCelebration, setShowCelebration] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        if (prevConnectionState !== connectionState) {
            if (connectionState === 'connected' && ['disconnected', 'error'].includes(prevConnectionState)) {
                toast.success('🎉 Back online!', {
                    description: 'Connection restored successfully',
                    duration: 3000
                })
                setShowCelebration(true)
                setTimeout(() => setShowCelebration(false), 3000)
            } else if (['error', 'disconnected'].includes(connectionState) && prevConnectionState === 'connected') {
                toast.error('⚠️ Connection lost', {
                    description: 'Trying to reconnect...',
                    duration: 5000
                })
            }
            setPrevConnectionState(connectionState)
        }
    }, [connectionState, prevConnectionState])

    const getStatusConfig = () => {
        switch (connectionState) {
            case 'connected':
                return {
                    gradient: 'from-emerald-400 via-green-500 to-teal-600',
                    bgGradient: 'from-emerald-50/80 via-green-50/60 to-teal-50/80 dark:from-emerald-950/30 via-green-950/20 to-teal-950/30',
                    text: 'Online & Ready',
                    emoji: '🟢',
                    badgeVariant: 'default' as const,
                    icon: Wifi,
                    iconColor: 'text-emerald-600 dark:text-emerald-400',
                    borderColor: 'border-emerald-300/50 dark:border-emerald-700/50',
                    shadowColor: 'shadow-emerald-500/20',
                    funMessage: ['All systems go! 🚀', 'Vibing online! ✨', 'Connected & thriving! 🌟'][Math.floor(Math.random() * 3)]
                }
            case 'connecting':
                return {
                    gradient: 'from-amber-400 via-orange-500 to-yellow-500',
                    bgGradient: 'from-amber-50/80 via-orange-50/60 to-yellow-50/80 dark:from-amber-950/30 via-orange-950/20 to-yellow-950/30',
                    text: 'Connecting...',
                    emoji: '🟡',
                    badgeVariant: 'secondary' as const,
                    icon: Radio,
                    iconColor: 'text-amber-600 dark:text-amber-400',
                    borderColor: 'border-amber-300/50 dark:border-amber-700/50',
                    shadowColor: 'shadow-amber-500/20',
                    funMessage: 'Establishing link... ⚡'
                }
            case 'disconnected':
                return {
                    gradient: 'from-slate-400 via-gray-500 to-zinc-500',
                    bgGradient: 'from-slate-50/80 via-gray-50/60 to-zinc-50/80 dark:from-slate-950/30 via-gray-950/20 to-zinc-950/30',
                    text: 'Offline',
                    emoji: '⚫',
                    badgeVariant: 'secondary' as const,
                    icon: WifiOff,
                    iconColor: 'text-slate-500 dark:text-slate-400',
                    borderColor: 'border-slate-300/50 dark:border-slate-700/50',
                    shadowColor: 'shadow-slate-500/20',
                    funMessage: 'Lost in the void... 🌌'
                }
            case 'error':
                return {
                    gradient: 'from-red-500 via-rose-600 to-pink-600',
                    bgGradient: 'from-red-50/80 via-rose-50/60 to-pink-50/80 dark:from-red-950/30 via-rose-950/20 to-pink-950/30',
                    text: 'Connection Error',
                    emoji: '🔴',
                    badgeVariant: 'destructive' as const,
                    icon: Link2Off,
                    iconColor: 'text-red-600 dark:text-red-400',
                    borderColor: 'border-red-300/50 dark:border-red-700/50',
                    shadowColor: 'shadow-red-500/20',
                    funMessage: 'Houston, we have a problem! 🛸'
                }
        }
    }

    const status = getStatusConfig()
    const StatusIcon = status.icon

    return (
        <motion.div
            layout
            className={cn(
                'group relative overflow-hidden rounded-3xl border-2 backdrop-blur-md',
                'bg-gradient-to-br', status.bgGradient,
                status.borderColor,
                'shadow-xl hover:shadow-2xl',
                status.shadowColor,
                'transition-all duration-500 ease-out',
                'hover:border-opacity-80',
                className
            )}
            whileHover={{
                scale: 1.03,
                rotateY: 2,
                rotateX: 1
            }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                duration: 0.3
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                transformStyle: 'preserve-3d'
            }}
        >
            {/* Animated mesh gradient background */}
            <div className="absolute inset-0 opacity-20">
                <motion.div
                    className={cn('absolute inset-0 bg-gradient-to-br', status.gradient)}
                    animate={{
                        backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        backgroundSize: ['100% 100%', '120% 120%', '100% 100%']
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatType: "reverse"
                    }}
                    style={{
                        backgroundImage: `conic-gradient(from 0deg, ${status.gradient.replace('from-', '').replace(' via-', ', ').replace(' to-', ', ')})`
                    }}
                />
            </div>

            {/* Glowing orb effect */}
            {connectionState === 'connected' && (
                <motion.div
                    className="absolute top-2 right-2 w-3 h-3 bg-emerald-400 rounded-full"
                    animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [0.8, 1.2, 0.8],
                        boxShadow: [
                            '0 0 10px rgba(52, 211, 153, 0.5)',
                            '0 0 20px rgba(52, 211, 153, 0.8)',
                            '0 0 10px rgba(52, 211, 153, 0.5)'
                        ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}

            <div className="relative p-5 flex flex-col sm:flex-row items-center justify-between gap-5">
                {/* Status Section */}
                <div className="flex items-center gap-5">
                    {/* Enhanced Status Icon Container */}
                    <div className="relative">
                        <motion.div
                            className={cn(
                                'flex items-center justify-center w-16 h-16 rounded-2xl',
                                'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm',
                                'shadow-xl border border-white/20 dark:border-gray-800/20',
                                'group-hover:shadow-2xl'
                            )}
                            animate={connectionState === 'connecting' ? {
                                rotate: [0, 360],
                                scale: [1, 1.1, 1]
                            } : isHovered ? {
                                scale: 1.1,
                                rotateY: 10
                            } : {}}
                            transition={connectionState === 'connecting' ? {
                                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                            } : {
                                duration: 0.3,
                                type: "spring",
                                stiffness: 300
                            }}
                        >
                            <StatusIcon className={cn('w-7 h-7', status.iconColor)} />

                            {/* Status emoji overlay */}
                            <motion.div
                                className="absolute -top-1 -right-1 text-lg"
                                animate={connectionState === 'connected' ? {
                                    rotate: [0, 10, -10, 0],
                                } : {}}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {status.emoji}
                            </motion.div>
                        </motion.div>

                        {/* Enhanced connection rings for connected state */}
                        {connectionState === 'connected' && (
                            <>
                                {[...Array(3)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute inset-0 rounded-2xl border-2 border-emerald-400/30"
                                        animate={{
                                            scale: [1, 1.5 + i * 0.3],
                                            opacity: [0.6, 0, 0.6]
                                        }}
                                        transition={{
                                            duration: 2.5,
                                            repeat: Infinity,
                                            delay: i * 0.3,
                                            ease: "easeOut"
                                        }}
                                    />
                                ))}
                            </>
                        )}

                        {/* Enhanced error shake with intensity */}
                        {connectionState === 'error' && (
                            <motion.div
                                className="absolute inset-0"
                                animate={{
                                    x: [-3, 3, -3, 3, -2, 2, 0],
                                    rotate: [-1, 1, -1, 1, 0]
                                }}
                                transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    repeatDelay: 1.5,
                                    ease: "easeInOut"
                                }}
                            />
                        )}
                    </div>

                    {/* Enhanced Status Text & Badge */}
                    <div className="flex flex-col items-start gap-2">
                        <motion.div
                            initial={{ opacity: 0, x: -30, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{
                                duration: 0.4,
                                type: "spring",
                                stiffness: 300
                            }}
                        >
                            <Badge
                                variant={status.badgeVariant}
                                className={cn(
                                    "text-sm font-bold shadow-lg px-4 py-1.5 rounded-full",
                                    "transition-all duration-300",
                                    "hover:scale-105 hover:shadow-xl",
                                    connectionState === 'connected' && "animate-pulse"
                                )}
                            >
                                {status.text}
                            </Badge>
                        </motion.div>

                        {/* Enhanced fun status messages with typing effect */}
                        <motion.div
                            className="text-sm font-medium text-gray-800 dark:text-gray-300 max-w-[200px]"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                        >
                            <motion.span
                                key={connectionState}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="block"
                            >
                                {status.funMessage}
                            </motion.span>
                        </motion.div>
                    </div>
                </div>

                {/* Enhanced Online Count Section */}
                <AnimatePresence mode="wait">
                    {connectionState === 'connected' && onlineCount > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: 30 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8, x: 30 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 25
                            }}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-2xl',
                                'bg-white/70 dark:bg-gray-900/70 backdrop-blur-md',
                                'shadow-lg border border-white/30 dark:border-gray-800/30',
                                'hover:shadow-xl hover:scale-105 transition-all duration-300'
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <motion.div
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </motion.div>
                                <div className="flex flex-col items-center">
                                    <motion.span
                                        className="text-lg font-bold text-gray-800 dark:text-gray-200"
                                        key={onlineCount}
                                        initial={{ scale: 1.3, color: '#10b981' }}
                                        animate={{ scale: 1, color: '#374151' }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {onlineCount}
                                    </motion.span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        online
                                    </span>
                                </div>
                            </div>

                            {/* Animated heart beat for community feeling */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.3, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <Heart className="w-4 h-4 text-red-500 fill-current" />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Enhanced celebration fireworks */}
            <AnimatePresence>
                {showCelebration && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    opacity: 0,
                                    scale: 0,
                                    x: "50%",
                                    y: "50%",
                                    rotate: Math.random() * 360
                                }}
                                animate={{
                                    opacity: [0, 1, 1, 0],
                                    scale: [0, 1.5, 1, 0],
                                    x: `${50 + (Math.random() - 0.5) * 300}%`,
                                    y: `${50 + (Math.random() - 0.5) * 300}%`,
                                    rotate: Math.random() * 720
                                }}
                                transition={{
                                    duration: 2,
                                    delay: i * 0.08,
                                    ease: "easeOut"
                                }}
                                className="absolute"
                            >
                                {i % 3 === 0 ? (
                                    <Sparkles className="w-5 h-5 text-emerald-500" />
                                ) : i % 3 === 1 ? (
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                ) : (
                                    <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Dynamic border glow */}
            {(connectionState === 'connected' || isHovered) && (
                <motion.div
                    className={cn(
                        "absolute inset-0 rounded-3xl border-2",
                        connectionState === 'connected'
                            ? "border-emerald-400/50"
                            : "border-blue-400/30"
                    )}
                    animate={{
                        boxShadow: connectionState === 'connected' ? [
                            "0 0 30px rgba(52, 211, 153, 0.1)",
                            "0 0 60px rgba(52, 211, 153, 0.3)",
                            "0 0 30px rgba(52, 211, 153, 0.1)"
                        ] : [
                            "0 0 20px rgba(59, 130, 246, 0.1)",
                            "0 0 40px rgba(59, 130, 246, 0.2)",
                            "0 0 20px rgba(59, 130, 246, 0.1)"
                        ]
                    }}
                    transition={{
                        duration: connectionState === 'connected' ? 3 : 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            )}

            {/* Subtle noise texture overlay for premium feel */}
            <div
                className="absolute inset-0 opacity-[0.015] mix-blend-multiply dark:mix-blend-screen"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />
        </motion.div>
    )
}