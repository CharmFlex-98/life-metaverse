import {ColorMatrixFilter, Rectangle, Sprite, Texture} from "pixi.js";
import {useRef, useState} from "react";

export type Parts = keyof PartTexture

export interface PartTexture {
    hair?: Texture
    head: Texture
    body: Texture
    shirt?: Texture
    pants?: Texture
    shoes?: Texture
}

interface SpriteInfo {
    sprite: Sprite
    size: number
}


interface UseAvatarAnimationProps {
    partsTexture: PartTexture
    frameWidth: number
    frameHeight: number
    totalFrames: number
    animationSpeed: number // The animation loops can be done in 1 sec.
    outputSize: number
}

export const useAvatarAnimation = ({
                                       partsTexture,
                                       frameWidth,
                                       frameHeight,
                                       totalFrames,
                                       animationSpeed,
                                       outputSize
                                   }: UseAvatarAnimationProps) => {
    const [sprites, setSprites] = useState<SpriteInfo[]>([])

    const frameCount = useRef(0)
    const frameColumnIndex = useRef(0)

    const createSprite = (texture: Texture, row: number, column: number) => {
        const frame = new Texture({
            source: texture?.baseTexture,
            frame: new Rectangle(
                column * frameWidth,
                row * frameHeight,
                frameWidth,
                frameHeight
            )
        })
        const sprite = new Sprite(frame)
        // const grayscaleFilter = new ColorMatrixFilter();
        // grayscaleFilter.desaturate(); // or grayscaleFilter.blackAndWhite(true);
        //
        // sprite.filters = [grayscaleFilter];
        return sprite
    }

    const updateAnimation = (rowIndex: number) => {
        if (frameCount.current > 60 / (totalFrames * animationSpeed)) {
            frameCount.current = 0

            if (frameColumnIndex.current == totalFrames - 1) {
                frameColumnIndex.current = 0
            } else {
                frameColumnIndex.current += 1
            }

        }

        frameCount.current += 1

        const res: Partial<Record<Parts, SpriteInfo>> = {}

        const parts = Object.keys(partsTexture) as Parts[]
        parts.forEach((part) => {
            const texture = partsTexture[part]
            if (texture) {
                res[part] = {
                    sprite: createSprite(texture, rowIndex, frameColumnIndex.current),
                    size: outputSize
                }
            }
        })

        setSprites([res.body, res.pants, res.shirt, res.head, res.hair, res.shoes].filter(
            (s): s is SpriteInfo => s !== undefined
        ))
    }

    return {sprites, updateAnimation}
}