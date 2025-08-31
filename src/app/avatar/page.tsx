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
import {
    AvatarGender,
    AvatarImportConfig,
    AvatarPart,
    BroadCastAvatarEventResponse,
    CreateAvatarRequest
} from "@/app/avatar/types";
import {AvatarInfo, AvatarPartInfo, AvatarSelector} from "@/app/avatar/ui/AvatarSelector";
import {Spinner} from "@/components/ui/shadcn-io/spinner";
import {useBroadcast} from "@/app/communication/useSubscribeEvent";
import {IMessage} from "@stomp/stompjs";
import {getById, usePreloadAssets} from "@/app/core/preload";
import {PreloadAvatarAssets} from "@/app/avatar/Preload";
import {Dialog} from "@radix-ui/react-dialog"
import {DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {ComponentTexture} from "@/app/avatar/types";
import {Assets} from "pixi.js";
import AvatarPreview from "@/app/avatar/ui/AvatarPreview";
import backgroundAsset from "../../../public/builder_bg.png";
import {toast} from "sonner";
import {Input} from "@/components/ui/input";
import {HttpError, httpGet, httpPost, networkClient} from "@/app/communication/networkClient";
import {useConfigProvider} from "@/app/ConfigProvider";


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
                Object.entries(colors ?? {}).forEach(([color, assetInfo]) => {
                    if (gender === "unisex") {
                        res.push(...[
                            {
                                id: assetInfo.id,
                                type: part as AvatarPart,
                                name: itemName,
                                gender: "male" as AvatarGender,
                                assetPath: assetInfo.path,
                                color: color,
                            }, {
                                id: assetInfo.id,
                                type: part as AvatarPart,
                                name: itemName,
                                gender: "female" as AvatarGender,
                                assetPath: assetInfo.path,
                                color: color,
                            }
                        ])
                    } else {
                        res.push({
                            id: assetInfo.id,
                            type: part as AvatarPart,
                            name: itemName,
                            gender: gender as AvatarGender,
                            assetPath: assetInfo.path,
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

const getUrl = (baseURl: string) => {
    return baseURl ? `https://${baseURl}` : `http://localhost:8081`
}

export default function AvatarCustomizer() {
    const canvasContainerRef = useRef<HTMLDivElement>(null)
    const previewContainerRef = useRef<HTMLDivElement>(null)
    const [selectedParts, setSelectedParts] = useState<AvatarInfo>({})
    const [avatarName, setAvatarName] = useState<string>("")
    const [previewComponent, setPreviewComponent] = useState<ComponentTexture>({})
    const [gender, setGender] = useState<Gender>("male")
    const [show, setShow] = useState(false)
    const {state, stompClient} = useBroadcast()
    const [avatarCreated, setAvatarCreated] = useState<AvatarCreated[]>([])
    const {completed, progress} = usePreloadAssets()
    const [isBuilderOpen, setIsBuilderOpen] = useState(false)
    const [bannerMessages, setBannerMessages] = useState<string | null>(null)
    const { baseUrl = "localhost:8081" } = useConfigProvider()

    const num = useRef(1)

    /*Initialize STOMP server*/
    useEffect(() => {
        const unsubscribe = stompClient.subscribe("/topic/avatars", (message: IMessage) => {
            if (message.body) {
                const res = {...JSON.parse(message.body)} as BroadCastAvatarEventResponse
                const parts = res.parts
                const paths = Object.entries(parts).map(([key, value]) => {
                    return [key, getById(value.id)]
                })
                const mapped = Object.fromEntries(paths) as AvatarPartUrlMap
                setAvatarCreated((prev) => [...prev, {...mapped, name: res.name} as AvatarCreated])
            }
        })

        return () => unsubscribe()
    }, []);

    useEffect(() => {
        httpGet<BroadCastAvatarEventResponse[]>(`${getUrl(baseUrl)}/api/avatars/all`, { defaultErrorHandler: false })
            .then((res) => {
                if (res.success) {
                    const allAvatars = res.data.map((value, index, array) => {
                        const pairs = Object.entries(value.parts).map(([key, value]) => {
                            return [key, getById(value.id)]
                        })
                        return { ...Object.fromEntries(pairs), name: value.name } as AvatarCreated
                    })
                    setAvatarCreated(allAvatars)
                    return
                }
                toast.error("Could not get avatar data. Please do try again later.")
            })
    }, []);

    const onCreateAvatar = useCallback(() => {
        if (!avatarName) {
            toast.error("Please give the avatar a name.")
            return;
        }
        const mapped = Object.entries(selectedParts).map(([part, info]) => {
            return [part,  { id: info.id } ]
        })
        const request = {name: avatarName, parts: Object.fromEntries(mapped)} as CreateAvatarRequest
        if (request) {
            httpPost<typeof request, void>(`${getUrl(baseUrl)}/api/avatars/create`, request, { defaultErrorHandler: false })
                .then((res) => {
                    if (res.success) {
                        setIsBuilderOpen(false)
                        toast.success("Avatar created successfully!")
                        return
                    }

                    if (res.error && res.error) {
                        toast.error(res.error.message)
                        return;
                    }

                    toast.error("Cannot create avatar. Please try again later.")
                })
        }
    }, [selectedParts, avatarName])


    useEffect(() => {
        if (completed) {
            setTimeout(() => {
                setShow(true)
            }, 500)
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


    // Load preview assets when builder is open and parts change
    useEffect(() => {
        if (!isBuilderOpen) return

        const tasks: Promise<void>[] = []

        Object.entries(builderPartFileName).forEach(([part, fileName]) => {
            if (!fileName) {
                setPreviewComponent((prev) => ({...prev, [part]: undefined}))
                return
            }

            const path = `${prefix}${fileName}`
            tasks.push(
                Assets.load(path).then((asset) => {
                    setPreviewComponent((prev) => ({...prev, [part]: asset}))
                }).catch((error) => {
                    console.warn(`Failed to load preview part ${part}:`, error)
                    setPreviewComponent((prev) => ({...prev, [part]: undefined}))
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
            {/*<PreloadAvatarAssets />*/}
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
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 col flex flex-col items-center">
                    <Spinner variant="bars" className="text-red-400"/>
                    <span className="text-orange-700">Loading... {progress}%</span>
                </div>
            )}

            {/* Avatar Builder Button - Only show when builder is closed */}
            {show && !isBuilderOpen && (
                <div className="absolute top-4 right-4 z-50">
                    <Button
                        onClick={() => setIsBuilderOpen(true)}
                        className="hover:bg-black text-white px-6 py-3 text-lg"
                    >
                        Open Avatar Builder
                    </Button>
                </div>
            )}


            {/* Avatar Builder Dialog */}
            <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
                <DialogContent className="min-w-[60vw] max-h-[90vh] overflow-auto justify-center">
                    <DialogHeader>
                        <DialogTitle>Avatar Builder</DialogTitle>
                        <DialogDescription>
                            Customize your avatar appearance
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-6 py-4 h-[70vh]">
                        {/* Left Side - Controls */}
                        <div className="max-w-[30vw] flex flex-col gap-4 overflow-y-auto pr-2">
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
                            <div className="flex w-full max-w-sm items-center gap-2">
                                <Input onChange={(event) => setAvatarName(event.target.value)} className="p-4 mt-4"
                                       placeholder="Avatar name"/>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-4">
                                <Button
                                    onClick={onCreateAvatar}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    Confirm Avatar
                                </Button>
                            </div>
                        </div>

                        {/* Right Side - Avatar Preview */}
                        <div
                            className="max-w-[30vw] max-h-[80vh] rounded-lg border-2 border-gray-200 relative flex flex-col">
                            <div ref={previewContainerRef} className="w-full h-full">
                                <AvatarPreview
                                    parentNode={previewContainerRef}
                                    background={backgroundAsset}
                                    avatarBuilderPartFileName={builderPartFileName}
                                />
                            </div>
                            <div
                                className="absolute bottom-2 left-2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded z-10">
                                Preview
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}