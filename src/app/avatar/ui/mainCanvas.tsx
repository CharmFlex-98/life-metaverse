"use client";
import {Application, extend} from "@pixi/react"
import {PropsWithChildren, Ref, RefObject, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Assets, Container, Sprite, Texture, TextureSource} from "pixi.js";
import {MyAvatar} from "@/components/avatar/avatar";
import {AvatarPart, AvatarRenderInfo, ComponentTexture, PartTexture} from "@/app/avatar/types";
import {StaticImageData} from "next/image";


extend({
    Container,
    Sprite,
    Texture
})

export type AvatarPartUrlMap = Partial<Record<AvatarPart, string>>

export type AvatarCreated = AvatarPartUrlMap & { name: string }


interface IMainCanvasProps {
    parentNode: RefObject<HTMLDivElement | null>
    background?: StaticImageData,
    avatarCreated: AvatarCreated[],
    show: boolean
}

const prefix = "/assets/avatar/animation/"


function MainCanvas({
                        parentNode,
                        show = false,
                        background,
                        avatarCreated
                    }: PropsWithChildren<IMainCanvasProps>) {

    const [avatarRenderInfo, setAvatarRenderInfo] = useState<Record<string, AvatarRenderInfo>>({});
    const [backgroundTexture, setBackgroundTexture] = useState<Texture>();
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

    // Track canvas size changes
    useEffect(() => {
        if (!parentNode.current) return;

        const updateSize = () => {
            if (parentNode.current) {
                setCanvasSize({
                    width: parentNode.current.clientWidth,
                    height: parentNode.current.clientHeight
                });
            }
        };

        // Initial size
        updateSize();

        // Create ResizeObserver to watch for size changes
        // const resizeObserver = new ResizeObserver(updateSize);
        // resizeObserver.observe(parentNode.current);

        // Also listen to window resize as fallback
        window.addEventListener('resize', updateSize);

        return () => {
            // resizeObserver.disconnect();
            window.removeEventListener('resize', updateSize);
        };
    }, [parentNode]);

    useEffect(() => {
        if (background) {
            Assets.load(background).then((res) => {
                setBackgroundTexture(res)
            })
        }
    }, [background]);

    useEffect(() => {
        console.log("avatar created: " + avatarCreated.length)
        // load "other created avatars"
        avatarCreated.forEach((avatar) => {
            if (avatarRenderInfo[avatar.name]) return

            const avatarTasks: Promise<void>[] = [];
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
                const randomX = Math.floor(Math.random() * canvasSize.width);
                const randomY = Math.floor(Math.random() * canvasSize.height);

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
    }, [avatarCreated, canvasSize]);

    const mapper = useMemo(() => {
        return Object.entries(avatarRenderInfo).map(([name, renderInfo], idx) => (
            <MyAvatar
                key={name}
                avatarRenderInfo={renderInfo}
            />
        ))
    }, [avatarRenderInfo])


    return (
        <Application 
            resizeTo={parentNode}
            // width={canvasSize.width}
            // height={canvasSize.height}
        >
            {show && (
                <pixiContainer>
                    {backgroundTexture && (
                        <pixiSprite
                            anchor={{x: 0, y: 0}}
                            eventMode={'static'}
                            texture={backgroundTexture}
                            width={canvasSize.width}
                            height={canvasSize.height}
                        />
                    )}

                    { mapper }
                </pixiContainer>
            )}
        </Application>
    )
}

export {MainCanvas}