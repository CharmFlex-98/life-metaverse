"use client";
import {Application, extend} from "@pixi/react"
import {PropsWithChildren, Ref, RefObject, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Assets, Container, Sprite, Texture, TextureSource} from "pixi.js";
import backgroundAsset from "../../../../public/builder_bg.png"
import {MyAvatar} from "@/components/avatar/avatar";
import {AvatarPart, AvatarRenderInfo, ComponentTexture, PartTexture} from "@/app/avatar/types";


extend({
    Container,
    Sprite,
    Texture
})

export type AvatarPartUrlMap = Partial<Record<AvatarPart, string>>

export type AvatarCreated = AvatarPartUrlMap & { name: string }


interface IMainCanvasProps {
    parentNode: RefObject<HTMLDivElement | null>
    avatarBuilderPartFileName: AvatarPartUrlMap,
    avatarCreated: AvatarCreated[],
    show: boolean
}

const prefix = "/assets/avatar/animation/"


function MainCanvas({
                        parentNode,
                        avatarBuilderPartFileName,
                        show = false,
                        avatarCreated
                    }: PropsWithChildren<IMainCanvasProps>) {

    const [component, setComponent] = useState<ComponentTexture>({});
    const [avatarRenderInfo, setAvatarRenderInfo] = useState<Record<string, AvatarRenderInfo>>({});

    useEffect(() => {
        const partFileName: typeof avatarBuilderPartFileName = {
            hair: avatarBuilderPartFileName.hair,
            head: avatarBuilderPartFileName.head,
            body: avatarBuilderPartFileName.body,
            pants: avatarBuilderPartFileName.pants,
            shoes: avatarBuilderPartFileName.shoes,
            shirt: avatarBuilderPartFileName.shirt,
        }
        const tasks: Promise<any>[] = []

        // always load background
        tasks.push(
            Assets.load(backgroundAsset).then((bg) => {
                setComponent((prev) => ({...prev, background: bg}))
            })
        )

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

    useEffect(() => {
        console.log("avatar created: " + avatarCreated.length)
        // load "other created avatars"
        avatarCreated.forEach((avatar) => {
            if (avatarRenderInfo[avatar.name]) return

            const avatarTasks: Promise<any>[] = [];
            const avatarTextures: PartTexture = {};

            Object.entries(avatar).forEach(([part, fileName]) => {
                if (part === "name") return; // skip the name field
                if (!fileName) {
                    avatarTextures[part as AvatarPart] = undefined;
                    return;
                }
                const path = `${prefix}${fileName}`;
                console.log(path)
                avatarTasks.push(
                    Assets.load(path).then((asset) => {
                        avatarTextures[part as AvatarPart] = asset;
                    })
                );
            });

            Promise.all(avatarTasks).then(() => {
                const randomX = Math.floor(Math.random() * (parentNode.current?.clientWidth || 800));
                const randomY = Math.floor(Math.random() * (parentNode.current?.clientHeight || 600));

                console.log("set avatar render info! " + avatar.name)
                setAvatarRenderInfo((prev) => ({
                    ...prev,
                    [avatar.name]: {
                        partTexture: avatarTextures,
                        name: "",
                        position: {x: randomX, y: randomY},
                    },
                }));
            })
        });
    }, [avatarCreated]);

    const avatarPosition = (parentNode.current?.clientWidth && parentNode.current?.clientHeight) ? {
        x: parentNode.current?.clientWidth / 2,
        y: parentNode.current?.clientHeight / 2
    } : {x: 0, y: 0}

    const mapper = useMemo(() => {
        return Object.entries(avatarRenderInfo).map(([name, renderInfo], idx) => (
            <MyAvatar
                key={name}
                avatarRenderInfo={renderInfo}
            />
        ))
    }, [avatarRenderInfo])

    return (
        <Application resizeTo={parentNode}>
            {show && (
                <pixiContainer>
                    <pixiSprite
                        anchor={{x: 0, y: 0}}
                        eventMode={'static'}
                        texture={component.background}
                        width={parentNode.current?.clientWidth}
                        height={parentNode.current?.clientHeight}
                    />

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
                            name: "builder",
                            position: avatarPosition,
                        }}
                    />

                    { mapper }
                </pixiContainer>
            )
            }
        </Application>
    )
}

export {MainCanvas}