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
import {useBroadcast} from "@/app/communication/useSubscribeEvent";
import {IMessage} from "@stomp/stompjs";
import {usePreloadAssets} from "@/app/core/preload";
import {PreloadAvatarAssets} from "@/app/avatar/Preload";
import { Dialog } from "@radix-ui/react-dialog"
import {DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {ComponentTexture} from "@/app/avatar/types";
import {Assets} from "pixi.js";
import AvatarPreview from "@/app/avatar/ui/AvatarPreview";
import backgroundAsset from "../../../public/builder_bg.png";


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
const prefix = "/assets/avatar/animation/"

export default function AvatarCustomizer() {
    const canvasContainerRef = useRef<HTMLDivElement>(null)
    const previewContainerRef = useRef<HTMLDivElement>(null)
    const [selectedParts, setSelectedParts] = useState<AvatarInfo>({})
    const [finalizedAvatar, setFinalizedAvatar] = useState<AvatarInfo>({})
    const [previewComponent, setPreviewComponent] = useState<ComponentTexture>({})
    const [gender, setGender] = useState<Gender>("male")
    const [show, setShow] = useState(false)
    const { state, stompClient } = useBroadcast()
    const [avatarCreated, setAvatarCreated] = useState<AvatarCreated[]>([])
    const { completed, progress } = usePreloadAssets()
    const [isBuilderOpen, setIsBuilderOpen] = useState(false)


    const num = useRef(1)

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

    const onConfirmAvatar = useCallback(() => {
        // Save the current selection as the finalized avatar
        setFinalizedAvatar(selectedParts)
        setIsBuilderOpen(false)
        console.log("Avatar finalized: " + JSON.stringify(selectedParts))
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

    const builderPartFileName = useMemo(() => {
        return Object.fromEntries(Object.entries(selectedParts).map(([key, value]) => {
            return [key, value.assetPath]
        }))
    }, [selectedParts])

    const finalPartFileName = useMemo(() => {
        return Object.fromEntries(Object.entries(finalizedAvatar).map(([key, value]) => {
            return [key, value.assetPath]
        }))
    }, [finalizedAvatar])

    // Load preview assets when builder is open and parts change
    useEffect(() => {
        if (!isBuilderOpen) return

        const tasks: Promise<void>[] = []

        Object.entries(builderPartFileName).forEach(([part, fileName]) => {
            if (!fileName) {
                setPreviewComponent((prev) => ({ ...prev, [part]: undefined }))
                return
            }

            const path = `${prefix}${fileName}`
            tasks.push(
                Assets.load(path).then((asset) => {
                    setPreviewComponent((prev) => ({ ...prev, [part]: asset }))
                }).catch((error) => {
                    console.warn(`Failed to load preview part ${part}:`, error)
                    setPreviewComponent((prev) => ({ ...prev, [part]: undefined }))
                })
            )
        })

        if (tasks.length > 0) {
            Promise.all(tasks).then(() => {
                console.log("✅ Preview assets loaded")
            })
        }
    }, [builderPartFileName, isBuilderOpen])

    return (
        <div className="relative h-screen w-screen">
            <PreloadAvatarAssets />
            {/* Canvas fills the background */}
            <div ref={canvasContainerRef} className="h-full w-full">
                <MainCanvas parentNode={canvasContainerRef}
                            background={backgroundAsset}
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

            {/* Avatar Builder Button - Only show when builder is closed */}
            {show && !isBuilderOpen && (
                <div className="absolute top-4 right-4 z-50">
                    <Button
                        onClick={() => setIsBuilderOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg"
                    >
                        Open Avatar Builder
                    </Button>
                </div>
            )}


            {/* Avatar Builder Dialog */}
            <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
                    <DialogHeader>
                        <DialogTitle>Avatar Builder</DialogTitle>
                        <DialogDescription>
                            Customize your avatar appearance
                        </DialogDescription>
                    </DialogHeader>

                    <div className="w-full flex flex-col gap-6 py-4">
                        {/* Left Side - Controls */}
                        <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] pr-2">
                            {/* Gender Selector */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Gender</label>
                                <Select onValueChange={(val: Gender) => setGender(val)} value={gender}>
                                    <SelectTrigger>
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
                            </div>

                            {/* Dynamic Avatar Part Selectors */}
                            {selectors}

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-4 ">
                                <Button
                                    onClick={onConfirmAvatar}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Confirm Avatar
                                </Button>
                            </div>
                        </div>

                        <div ref={previewContainerRef} className="flex-1 flex flex-col items-center justify-center">
                            <div className="overflow-x-hidden">Test</div>
                            <AvatarPreview
                                parentNode={previewContainerRef}
                                background={backgroundAsset}
                                avatarBuilderPartFileName={builderPartFileName} />
                            <div className="absolute bottom-2 left-2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
                                Preview
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>


            {/*/!* Controls *!/*/}
            {/*{show &&*/}
            {/*    <div*/}
            {/*        className="absolute top-0 right-0 flex flex-col items-center gap-2 p-4 rounded-lg shadow-lg bg-white/70">*/}
            {/*        /!* Gender Selector *!/*/}
            {/*        <Select onValueChange={(val: Gender) => setGender(val)} value={gender}>*/}
            {/*            <SelectTrigger className="w-[180px]">*/}
            {/*                <SelectValue placeholder="Select gender"/>*/}
            {/*            </SelectTrigger>*/}
            {/*            <SelectContent>*/}
            {/*                <SelectGroup>*/}
            {/*                    <SelectLabel>Gender</SelectLabel>*/}
            {/*                    <SelectItem value="male">Male</SelectItem>*/}
            {/*                    <SelectItem value="female">Female</SelectItem>*/}
            {/*                </SelectGroup>*/}
            {/*            </SelectContent>*/}
            {/*        </Select>*/}


            {/*        /!* Dynamic Avatar Part Selectors *!/*/}
            {/*        {selectors}*/}

            {/*        <div>*/}
            {/*            <Button onClick={onCreateAvatar}>CREATE</Button>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*}*/}
        </div>
    )
}