"use client";
import {Application, extend} from "@pixi/react"
import {PropsWithChildren, Ref, RefObject, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Assets, Container, Sprite, Texture, TextureSource} from "pixi.js";
import backgroundAsset from "../../../assets/container.png"
import {MyAvatar} from "@/components/avatar/avatar";
import {Parts} from "@/components/avatar/useAvatarAnimation";


extend({
    Container,
    Sprite,
    Texture
})

interface IMainCanvasProps {
    parentNode: RefObject<HTMLDivElement | null>
    avatarPartFileName: Partial<Record<Parts, string>>
}

function MainCanvas({parentNode, avatarPartFileName, children}: PropsWithChildren<IMainCanvasProps>) {

    const [bg, setBg] = useState<any | null>(null);
    const [avatarTexture, setAvatarTexture] = useState<any | null>(null)

    const [hairTexture, setHairTexture] = useState<any>(null);
    const [headTexture, setHeadTexture] = useState<any>(null);
    const [bodyTexture, setBodyTexture] = useState<any>(null);
    const [shirtTexture, setShirtTexture] = useState<any>(null);
    const [pantsTexture, setPantsTexture] = useState<any>(null);
    const [shoesTexture, setShoesTexture] = useState<any>(null);

    useEffect(() => {
        Assets.load(backgroundAsset).then((loaded) => {
            console.log("set bg")
            setBg(loaded)
        })

        const prefix = "/assets/avatar/animation/"

        console.log("refresh: " + JSON.stringify(avatarPartFileName))

        // Assets.load will use app router path. e.g, this page is /avatar, then will load "avatar/{name}"
        avatarPartFileName.hair ? Assets.load(`${prefix}${avatarPartFileName.hair}`).then((res) => {
            setHairTexture(res)
        }) : setHairTexture(null)
        avatarPartFileName.head ? Assets.load(`${prefix}${avatarPartFileName.head}`).then((res) => {
            setHeadTexture(res)
        }) : setHeadTexture(null)
        avatarPartFileName.body ? Assets.load(`${prefix}${avatarPartFileName.body}`).then((res) => {
            setBodyTexture(res)
        }) : setBodyTexture(null)
        avatarPartFileName.pants ? Assets.load(`${prefix}${avatarPartFileName.pants}`).then((res) => {
            setPantsTexture(res)
        }) : setPantsTexture(null)
        avatarPartFileName.shirt ? Assets.load(`${prefix}${avatarPartFileName.shirt}`).then((res) => {
            setShirtTexture(res)
        }) : setShirtTexture(null)
        avatarPartFileName.shoes ? Assets.load(`${prefix}${avatarPartFileName.shoes}`).then((res) => {
            setShoesTexture(res)
        }) : setShoesTexture(null)

    }, [avatarPartFileName]);

    let avatarPosition = parentNode.current?.clientWidth && parentNode.current?.clientWidth && {
        x: parentNode.current?.clientWidth / 2,
        y: parentNode.current?.clientHeight / 2
    }
    if (!avatarPosition) {
        avatarPosition = {x: 0, y: 0}
    }

    console.log("load")

    return (
        <Application resizeTo={parentNode}>
            <pixiContainer>
                <pixiSprite
                    // ref={spriteRef}
                    anchor={{x: 0, y: 0}}
                    eventMode={'static'}
                    texture={bg}
                    width={parentNode.current?.clientWidth}
                    height={parentNode.current?.clientHeight}
                />
                <MyAvatar
                    texture={avatarTexture}
                    partTexture={{
                        hair: hairTexture,
                        head: headTexture,
                        body: bodyTexture,
                        shirt: shirtTexture,
                        pants: pantsTexture,
                        shoes: shoesTexture,
                    }}
                    position={avatarPosition}/>
            </pixiContainer>
        </Application>
    )
}

export {MainCanvas}