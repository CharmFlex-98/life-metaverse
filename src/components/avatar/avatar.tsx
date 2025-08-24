import {ColorMatrixFilter, Texture} from "pixi.js";
import {useTick} from "@pixi/react";
import {PartTexture, useAvatarAnimation} from "@/components/avatar/useAvatarAnimation";
import {useMemo} from "react";


interface IAvatarProps {
    partTexture: PartTexture
    position: { x: number, y: number },
}

export const MyAvatar = ({partTexture, position}: IAvatarProps) => {

    const {sprites, updateAnimation} = useAvatarAnimation({
        partsTexture: partTexture,
        frameWidth: 64,
        frameHeight: 64,
        totalFrames: 2,
        animationSpeed: 3,
        outputSize: 192
    })

    useTick((delta) => {
        updateAnimation(24)
    })

    const grayscale = useMemo(() => {
        const res = new ColorMatrixFilter();
        res.blackAndWhite(true);
        return res;
    }, [])

    return (
        <pixiContainer>
            {sprites && sprites.length > 0 && sprites.map((sprite, i) => {
                return sprite && (<pixiSprite
                    key={i}
                    texture={sprite?.sprite.texture}
                    anchor={0.5}
                    width={sprite.size}
                    height={sprite.size}
                    x={position.x}
                    y={position.y}
                    // filters={[grayscale]}
                    // tint={0xff0000}
                />)
            })}
        </pixiContainer>
    )
}