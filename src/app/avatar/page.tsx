"use client"

import {Button} from "@/components/ui/button"
import {useCallback, useEffect, useMemo, useRef, useState} from "react"
import {AvatarCreated, AvatarPartUrlMap, MainCanvas} from "@/app/avatar/ui/mainCanvas"
import assetsIndex from "../../assets/avatar/assetsIndex.json"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {AvatarGender, AvatarImportConfig, AvatarPart} from "@/app/avatar/types";
import {AvatarInfo, AvatarPartInfo, AvatarSelector} from "@/app/avatar/ui/AvatarSelector";
import {Spinner} from "@/components/ui/shadcn-io/spinner";
import {stompClient} from "@/app/communication/broadcast";
import {useBroadcast} from "@/app/communication/useSubscribeEvent";
import {IMessage} from "@stomp/stompjs";
import {usePreloadAssets} from "@/app/core/preload";

type Gender = "male" | "female" | "unisex"

const avatarPartsConfig: { key: AvatarPart; label: string; autoSelect?: boolean }[] = [
    {key: "head", label: "Head", autoSelect: true},
    {key: "body", label: "Body", autoSelect: true},
    {key: "hair", label: "Hair"},
    {key: "shirt", label: "Shirt"},
    {key: "pants", label: "Pants"},
    {key: "shoes", label: "Shoes"},
]

const buildAvatarPartInfo = () => {
    const avatarAssets: AvatarImportConfig = assetsIndex

    const res: AvatarPartInfo[] = []
    Object.entries(avatarAssets).forEach(([part, genders]) => {
        Object.entries(genders ?? {}).forEach(([gender, itemNames]) => {
            Object.entries(itemNames ?? {}).forEach(([itemName, colors]) => {
                Object.entries(colors ?? {}).forEach(([color, assetPath]) => {
                    if (gender === "unisex") {
                        res.push(...[
                            {
                                type: part as AvatarPart,
                                name: itemName,
                                gender: "male" as AvatarGender,
                                assetPath: assetPath,
                                color: color,
                            }, {
                                type: part as AvatarPart,
                                name: itemName,
                                gender: "female" as AvatarGender,
                                assetPath: assetPath,
                                color: color,
                            }
                        ])
                    } else {
                        res.push({
                            type: part as AvatarPart,
                            name: itemName,
                            gender: gender as AvatarGender,
                            assetPath: assetPath,
                            color: color,
                        })
                    }
                })
            })
        })
    })

    return res
}

type AvatarPartInfoMap = Record<
    AvatarPart,
    Partial<Record<AvatarGender, AvatarPartInfo[]>>
>

function buildAvatarPartInfoMap() {
    const infos = buildAvatarPartInfo()
    const map: AvatarPartInfoMap = {
        hair: {},
        head: {},
        body: {},
        pants: {},
        shoes: {},
        shirt: {}
    }

    infos.forEach(info => {
        if (!map[info.type][info.gender]) {
            map[info.type][info.gender] = []
        }

        map[info.type][info.gender]!.push(info)
    })

    return map
}

const partInfoMap = buildAvatarPartInfoMap()

export default function AvatarCustomizer() {
    const canvasContainerRef = useRef<HTMLDivElement>(null)
    const [selectedParts, setSelectedParts] = useState<AvatarInfo>({})
    const [gender, setGender] = useState<Gender>("male")
    const [show, setShow] = useState(false)
    const { state, stompClient } = useBroadcast()
    const [avatarCreated, setAvatarCreated] = useState<AvatarCreated[]>([])
    const { completed, progress } = usePreloadAssets()


    let num = useRef(1)

    /*Initialize STOMP server*/
    useEffect(() => {
        const unsubscribe = stompClient.subscribe("/topic/avatar-create", (message: IMessage) => {
            if (message.body) {
                console.log("created: " + message.body)
                const res = { ...JSON.parse(message.body), name: num.current } as AvatarInfo
                const mapped = Object.fromEntries(Object.entries(res).map(([part, info]) => {
                    return [part, info.assetPath]
                })) as AvatarPartUrlMap
                num.current = num.current + 1
                console.log("res is: " + JSON.stringify(res))
                setAvatarCreated((prev) => [...prev, { ...mapped, name: num.current.toString() } as AvatarCreated])
            }
        })

        return () => unsubscribe()
    }, []);

    const onCreateAvatar = useCallback(() => {
        console.log("selectedParts: " + JSON.stringify(selectedParts))
        stompClient.publish("/topic/avatar-create", selectedParts)
    }, [selectedParts])


    useEffect(() => {
        if (completed) {
            setTimeout(() => {
                setShow(true)
            }, 1500)
        }
    }, [completed]);

    // Reset when gender changes
    useEffect(() => {
        let res: Partial<Record<AvatarPart, AvatarPartInfo>> = {}
        avatarPartsConfig.forEach(({key, autoSelect}) => {
            if (autoSelect) {
                res = {...res, [key]: partInfoMap?.[key]?.[gender]?.[0] as AvatarPartInfo}
            }
        })
        setSelectedParts(res) // reset first
    }, [gender]);


    const handleSelection = (key: AvatarPart, partInfo: AvatarPartInfo) => {
        setSelectedParts((prev) => ({...prev, [key]: partInfo}))
    }

    // Map over parts instead of repeating JSX
    const selectors = useMemo(() => {
        return avatarPartsConfig.map(({key, label, autoSelect}) => {
            return (
                <AvatarSelector
                    key={key}
                    selectedPartInfo={
                        selectedParts[key] ??
                        (autoSelect
                            ? partInfoMap?.[key]?.[gender]?.[0]
                            : undefined)
                    }
                    partInfoList={partInfoMap?.[key]?.[gender] ?? []}
                    placeholder={`Select ${label}`}
                    onSelected={(partInfo) => handleSelection(key, partInfo)}
                />
            )
        })
    }, [gender, selectedParts])

    const partFileName = useMemo(() => {
        return Object.fromEntries(Object.entries(selectedParts).map(([key, value]) => {
            return [key, value.assetPath]
        }))
    }, [selectedParts])

    return (
        <div className="relative h-[100vh] w-[100vw]">

            {/* Canvas fills the background */}
            <div ref={canvasContainerRef} className="h-full w-[100vw]">
                <MainCanvas parentNode={canvasContainerRef}
                            avatarBuilderPartFileName={partFileName}
                            show={show}
                            avatarCreated={avatarCreated}
                />
            </div>


            {/* Loader*/}
            {!show && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 col flex flex-col items-center">
                    <Spinner variant="bars" className="text-red-400"/>
                    <span className="text-black">Loading... {progress}%</span>
                </div>
            )}


            {/* Controls */}
            {show &&
                <div
                    className="absolute top-0 right-0 flex flex-col items-center gap-2 p-4 rounded-lg shadow-lg bg-white/70">
                    {/* Gender Selector */}
                    <Select onValueChange={(val: Gender) => setGender(val)} value={gender}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select gender"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Gender</SelectLabel>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>


                    {/* Dynamic Avatar Part Selectors */}
                    {selectors}

                    <div>
                        <Button onClick={onCreateAvatar}>CREATE</Button>
                    </div>
                </div>
            }
        </div>
    )
}