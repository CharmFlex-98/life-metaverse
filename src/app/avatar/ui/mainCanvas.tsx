"use client";
import {Application, extend} from "@pixi/react"
import {PropsWithChildren, Ref, RefObject, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Assets, Container, Sprite, Texture, TextureSource} from "pixi.js";
import backgroundAsset from "../../../../public/builder_bg.png"
import {MyAvatar} from "@/components/avatar/avatar";
import {AvatarPart, ComponentTexture} from "@/app/avatar/types";


extend({
    Container,
    Sprite,
    Texture
})

export type AvatarPartUrlMap = Partial<Record<AvatarPart, string>>


interface IMainCanvasProps {
    parentNode: RefObject<HTMLDivElement | null>
    avatarPartFileName: AvatarPartUrlMap,
    show: boolean
}

function MainCanvas({parentNode, avatarPartFileName, show = false, children}: PropsWithChildren<IMainCanvasProps>) {

    const [component, setComponent] = useState<ComponentTexture>({});


    useEffect(() => {
        Assets.load(backgroundAsset).then((loaded) => {
            setComponent((res) => ({...res, background: loaded}))
        })

        const prefix = "/assets/avatar/animation/"

        // Assets.load will use app router path. e.g, this page is /avatar, then will load "avatar/{name}"
        avatarPartFileName.hair ? Assets.load(`${prefix}${avatarPartFileName.hair}`).then((res) => {
            setComponent((prev) => ({...prev, hair: res}))
        }) : setComponent((prev) => ({...prev, hair: undefined}))
        avatarPartFileName.head ? Assets.load(`${prefix}${avatarPartFileName.head}`).then((res) => {
            setComponent((prev) => {
                return {...prev, head: res}
            })
        }) : setComponent((prev) => ({...prev, head: undefined}))
        avatarPartFileName.body ? Assets.load(`${prefix}${avatarPartFileName.body}`).then((res) => {
            setComponent((prev) => ({...prev, body: res}))
        }) : setComponent((prev) => ({...prev, body: undefined}))
        avatarPartFileName.pants ? Assets.load(`${prefix}${avatarPartFileName.pants}`).then((res) => {
            setComponent((prev) => ({...prev, pants: res}))
        }) : setComponent((prev) => ({...prev, pants: undefined}))
        avatarPartFileName.shirt ? Assets.load(`${prefix}${avatarPartFileName.shirt}`).then((res) => {
            setComponent((prev) => ({...prev, shirt: res}))
        }) : setComponent((prev) => ({...prev, shirt: undefined}))
        avatarPartFileName.shoes ? Assets.load(`${prefix}${avatarPartFileName.shoes}`).then((res) => {
            setComponent((prev) => ({...prev, shoes: res}))
        }) : setComponent((prev) => ({...prev, shoes: undefined}))

    }, [avatarPartFileName]);

    let avatarPosition = parentNode.current?.clientWidth && parentNode.current?.clientWidth && {
        x: parentNode.current?.clientWidth / 2,
        y: parentNode.current?.clientHeight / 2
    }
    if (!avatarPosition) {
        avatarPosition = {x: 0, y: 0}
    }


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
                        partTexture={{
                            hair: component.hair,
                            head: component.head,
                            body: component.body,
                            shirt: component.shirt,
                            pants: component.pants,
                            shoes: component.shoes,
                        }}
                        position={avatarPosition}/>
                </pixiContainer>
            )
            }
        </Application>
    )
}

export {MainCanvas}