import {ColorMatrixFilter, Texture} from "pixi.js";
import {useTick} from "@pixi/react";
import { useAvatarAnimation} from "@/components/avatar/useAvatarAnimation";
import {useMemo} from "react";
import {AvatarRenderInfo, PartTexture} from "@/app/avatar/types";
import {AVATAR_SIZE} from "@/app/avatar/constants";


interface IAvatarProps {
    avatarRenderInfo: AvatarRenderInfo,
    avatarSize?: number
}

export const MyAvatar = ({avatarSize = AVATAR_SIZE, avatarRenderInfo}: IAvatarProps) => {

    const {sprites, updateAnimation} = useAvatarAnimation({
        partsTexture: avatarRenderInfo.partTexture,
        frameWidth: 64,
        frameHeight: 64,
        totalFrames: 2,
        animationSpeed: 3,
        outputSize: avatarSize
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
                    x={avatarRenderInfo.position.x}
                    y={avatarRenderInfo.position.y}
                    // filters={[grayscale]}
                    // tint={0xff0000}
                />)
            })}
        </pixiContainer>
    )
}