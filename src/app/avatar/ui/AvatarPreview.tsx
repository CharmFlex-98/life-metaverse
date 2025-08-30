"use client"
import {AvatarPartUrlMap} from "@/app/avatar/ui/mainCanvas";
import {RefObject, useEffect, useState, useMemo} from "react";
import {Assets} from "pixi.js";
import {ComponentTexture} from "@/app/avatar/types";
import {Application} from "@pixi/react";
import {MyAvatar} from "@/components/avatar/avatar";
import {StaticImageData} from "next/image";
import {Spinner} from "@/components/ui/shadcn-io/spinner";

interface AvatarPreviewProps {
    parentNode: RefObject<HTMLDivElement | null>
    background?: StaticImageData,
    avatarBuilderPartFileName: AvatarPartUrlMap,
}

const prefix = "/assets/avatar/animation/"

function AvatarPreview({parentNode, background, avatarBuilderPartFileName}: AvatarPreviewProps) {
    const [component, setComponent] = useState<ComponentTexture>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false)
        }, 500)
    }, []);


    // Load background texture
    useEffect(() => {
        if (background) {
            Assets.load(background).then((bg) => {
                setComponent((prev) => ({...prev, background: bg}))
            }).catch((error) => {
                console.warn('Failed to load background:', error);
                setComponent((prev) => ({...prev, background: undefined}))
            })
        } else {
            setComponent((prev) => ({...prev, background: undefined}))
        }
    }, [background]);

    // Load avatar parts
    useEffect(() => {
        const tasks: Promise<void>[] = []

        // Load avatar parts
        Object.entries(avatarBuilderPartFileName).forEach(([part, fileName]) => {
            if (!fileName) {
                setComponent((prev) => ({...prev, [part]: undefined}))
                return
            }
            const path = `${prefix}${fileName}`
            tasks.push(
                Assets.load(path).then((asset) => {
                    setComponent((prev) => ({...prev, [part]: asset}))
                }).catch((error) => {
                    console.warn(`Failed to load avatar part ${part}:`, error);
                    setComponent((prev) => ({...prev, [part]: undefined}))
                })
            )
        })

        if (tasks.length > 0) {
            Promise.all(tasks).then(() => {
                console.log("✅ All avatar preview assets loaded")
            }).catch((error) => {
                console.error("Failed to load some avatar parts:", error);
            })
        } else {
        }
    }, [avatarBuilderPartFileName])

    useEffect(() => {

    }, [parentNode?.current?.clientHeight, parentNode?.current?.clientWidth]);

    // Calculate avatar position (center of canvas)
    const avatarPosition = () => ({
        x: (parentNode?.current?.clientWidth ?? 600) / 2,
        y: (parentNode?.current?.clientHeight ?? 600) / 2,
    });

    // Check if we have valid avatar parts to render
    const hasValidParts = useMemo(() => {
        return Object.values(component).some(texture =>
            texture !== undefined && texture !== component.background
        )
    }, [component]);

    return (
        <div className="relative h-full w-full">
            <Application resizeTo={parentNode}>
                {!isLoading && <pixiContainer>
                    {component.background && (
                        <pixiSprite
                            anchor={{x: 0, y: 0}}
                            eventMode={'static'}
                            texture={component.background}
                            width={parentNode?.current?.clientWidth}
                            height={parentNode?.current?.clientHeight}
                        />
                    )}

                    {/* Avatar */}
                    <MyAvatar
                        avatarRenderInfo={{
                            partTexture: {
                                hair: component.hair,
                                head: component.head,
                                body: component.body,
                                shirt: component.shirt,
                                pants: component.pants,
                                shoes: component.shoes,
                            },
                            name: "preview",
                            position: avatarPosition(),
                        }}
                    />
                </pixiContainer>}
            </Application>
            {isLoading && <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 col flex flex-col items-center">
                <Spinner variant="circle" className="text-red-400"/>
                <span className="text-black">Loading...</span>
            </div>}
        </div>
    )
}

export default AvatarPreview