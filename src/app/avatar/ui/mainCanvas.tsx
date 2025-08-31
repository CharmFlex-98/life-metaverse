"use client";
import React from "react";
import {Application, extend} from "@pixi/react"
import {PropsWithChildren, Ref, RefObject, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Assets, Container, Sprite, Texture, TextureSource, Text } from "pixi.js";
import {MyAvatar} from "@/components/avatar/avatar";
import {AvatarPart, AvatarRenderInfo, ComponentTexture, PartTexture} from "@/app/avatar/types";
import {StaticImageData} from "next/image";
import {AVATAR_SIZE} from "@/app/avatar/constants";


extend({
    Container,
    Sprite,
    Texture,
    Text
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
        // window.addEventListener('resize', updateSize);
        //
        // return () => {
        //     // resizeObserver.disconnect();
        //     window.removeEventListener('resize', updateSize);
        // };
    }, [parentNode]);

    useEffect(() => {
        if (background) {
            Assets.load(background).then((res) => {
                setBackgroundTexture(res)
            })
        }
    }, [background]);

    useEffect(() => {
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
                avatarTasks.push(
                    Assets.load(path).then((asset) => {
                        avatarTextures[part as AvatarPart] = asset;
                    })
                );
            });

            Promise.all(avatarTasks).then(() => {
                const randomX = Math.floor(Math.random() * canvasSize.width);
                const randomY = Math.floor(Math.random() * canvasSize.height);

                setAvatarRenderInfo((prev) => ({
                    ...prev,
                    [avatar.name]: {
                        partTexture: avatarTextures,
                        name: avatar.name,
                        position: {x: randomX, y: randomY},
                    },
                }));
            })
        });
    }, [avatarCreated, canvasSize]);

    const mapper = useMemo(() => {
        return Object.entries(avatarRenderInfo).map(([name, renderInfo], idx) => {
            const fragmentKey = `${name}_fragment`
            return (
                <React.Fragment key={fragmentKey}>
                    <MyAvatar
                        avatarRenderInfo={renderInfo}
                    />
                    <pixiText
                        text={name}
                        anchor={0.5}
                        x={renderInfo.position.x}
                        y={renderInfo.position.y - AVATAR_SIZE / 2}
                        style={{
                            fill: "white",
                            fontSize: 14,
                            fontWeight: "bold",
                            stroke: "black",
                        }}
                    />
                </React.Fragment>
            )
        })
    }, [avatarRenderInfo])


    return (
        <Application 
            resizeTo={parentNode}
        >
            {show && (
                <pixiContainer>
                    {backgroundTexture && (
                        <pixiSprite
                            key="background"
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