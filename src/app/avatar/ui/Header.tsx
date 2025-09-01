import {ConnectionStatus} from "@/app/communication/ui/ConnectionStatus";
import {ConnectionState} from "@/app/communication/broadcast";

interface HeaderProps {
    connectionState: ConnectionState
    onlineCount: number
}

export function Header({ connectionState, onlineCount }: HeaderProps) {
    return (
        <header className="absolute top-0 left-0 right-0 z-50">
            {/* Status Bar */}
            <div className="flex justify-between items-center p-4">
                <ConnectionStatus
                    connectionState={connectionState}
                    onlineCount={onlineCount}
                />
            </div>
        </header>
    )
}