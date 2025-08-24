"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {Button} from "@/components/ui/button"
import Image from "next/image"
import {AvatarGender, AvatarPart} from "@/app/avatar/types";
import {useMemo} from "react"; // adjust import path

interface AvatarSelectorProps {
    selectedPartInfo?: AvatarPartInfo
    partInfoList: AvatarPartInfo[]
    placeholder: string
    onSelected: (info: AvatarPartInfo) => void
}

export interface AvatarPartInfo {
    type: AvatarPart
    name: string
    gender: AvatarGender
    assetPath: string
    color: string
}

const assetPath = "/assets/avatar/selection/"
const groupByItem = (partInfoList: AvatarPartInfo[]) => {
    return partInfoList.reduce<Record<string, AvatarPartInfo[]>>((acc, current) => {
        const itemName = current.name
        if (!acc[itemName]) {
            acc[itemName] = []
        }
        acc[itemName].push(current)
        return acc
    }, {})
}

export function AvatarSelector({selectedPartInfo, partInfoList, placeholder, onSelected}: AvatarSelectorProps) {

    const itemGroup = useMemo(() => {
        return groupByItem(partInfoList)
    }, [partInfoList])

    const buttonDisabled = partInfoList?.length == 0 && !selectedPartInfo

    return (
        <DropdownMenu>
            <DropdownMenuTrigger disabled={buttonDisabled} asChild>
                <Button variant="outline" className="bg-transparent w-[220px] h-auto justify-between">
                    {buttonDisabled ? (<span className="text-red-700">No available item</span>)
                        : selectedPartInfo ? (
                            <div className="flex items-center gap-2 flex-wrap">
                                <Image
                                    src={assetPath + selectedPartInfo.assetPath}
                                    alt={selectedPartInfo.assetPath}
                                    width={64}
                                    height={64}
                                />
                                <span className="whitespace-normal break-words text-xs">{
                                    selectedPartInfo.name.replaceAll("_", " ")
                                }</span>
                            </div>
                        ) : (
                            <span className="text-gray-400">{placeholder}</span>
                        )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[240px]">
                <DropdownMenuLabel>Select item</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuGroup>
                    {Object.entries(itemGroup).map(([itemName, items]) => (
                        <DropdownMenuSub key={itemName}>
                            <DropdownMenuSubTrigger>{itemName.replaceAll("_", " ")}</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                {items.map((item) => (
                                    <DropdownMenuItem
                                        key={item.assetPath}
                                        onClick={() => onSelected(item)}
                                        className="flex items-center gap-2"
                                    >
                                        <Image
                                            src={assetPath + item.assetPath}
                                            alt={item.assetPath}
                                            width={40}
                                            height={40}
                                        />
                                        <span>{item.color}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
