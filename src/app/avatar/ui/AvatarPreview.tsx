"use client"
import {AvatarPartUrlMap} from "@/app/avatar/ui/mainCanvas";
import {RefObject, useEffect, useState} from "react";
import {Assets} from "pixi.js";
import {ComponentTexture} from "@/app/avatar/types";
import {Application} from "@pixi/react";
import {MyAvatar} from "@/components/avatar/avatar";
import {StaticImageData} from "next/image";

interface AvatarPreviewProps {
    parentNode?: RefObject<HTMLDivElement | null>
    background?: StaticImageData,
    avatarBuilderPartFileName: AvatarPartUrlMap,
}

const prefix = "/assets/avatar/animation/"


function AvatarPreview({parentNode, background, avatarBuilderPartFileName}: AvatarPreviewProps) {
    const [component, setComponent] = useState<ComponentTexture>({});

    useEffect(() => {
        if (background) {
            Assets.load(background).then((bg) => {
                setComponent((prev) => ({...prev, background: bg}))
            })
        } else {
            setComponent((prev) => ({...prev, background: undefined}))
        }
    }, [background]);
    useEffect(() => {
        const partFileName: typeof avatarBuilderPartFileName = {
            hair: avatarBuilderPartFileName.hair,
            head: avatarBuilderPartFileName.head,
            body: avatarBuilderPartFileName.body,
            pants: avatarBuilderPartFileName.pants,
            shoes: avatarBuilderPartFileName.shoes,
            shirt: avatarBuilderPartFileName.shirt,
        }
        const tasks: Promise<void>[] = []

        // dynamic parts loop instead of repeating
        Object.entries(partFileName)
            .forEach(([part, fileName]) => {
                console.log(part, fileName)
                if (!fileName) {
                    setComponent((prev) => ({...prev, [part]: undefined}))
                    return
                }
                const path = `${prefix}${fileName}`
                tasks.push(
                    Assets.load(path).then((asset) => {
                        setComponent((prev) => ({...prev, [part]: asset}))
                    })
                )
            })

        Promise.all(tasks).then(() => {
            console.log("✅ All avatar assets loaded")
        })

    }, [avatarBuilderPartFileName])

    const avatarPosition = (parentNode?.current?.clientWidth && parentNode.current?.clientHeight) ? {
        x: parentNode.current?.clientWidth / 2,
        y: parentNode.current?.clientHeight / 2
    } : {x: 0, y: 0}

    console.log("position: " + JSON.stringify(avatarPosition));

    return (
        <Application resizeTo={parentNode}>
            <pixiContainer>
                <pixiSprite
                    anchor={{x: 0, y: 0}}
                    eventMode={'static'}
                    texture={component.background}
                    // width={parentNode?.current?.clientWidth}
                    // height={parentNode?.current?.clientHeight}
                />

                {/*<MyAvatar*/}
                {/*    avatarRenderInfo={{*/}
                {/*        partTexture: {*/}
                {/*            hair: component.hair,*/}
                {/*            head: component.head,*/}
                {/*            body: component.body,*/}
                {/*            shirt: component.shirt,*/}
                {/*            pants: component.pants,*/}
                {/*            shoes: component.shoes,*/}
                {/*        },*/}
                {/*        name: "builder",*/}
                {/*        position: avatarPosition,*/}
                {/*    }}*/}
                {/*/>*/}
            </pixiContainer>
        </Application>
    )
}

export default AvatarPreview