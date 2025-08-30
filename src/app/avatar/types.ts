import {Texture} from "pixi.js";
import {Create} from "sharp";

export type AvatarPart =
    "body" |
    "hair" |
    "head" |
    "pants"|
    "shirt"|
    "shoes"

export type AvatarGender = "male" | "female" | "unisex"

export interface PartTexture {
    hair?: Texture
    head?: Texture
    body?: Texture
    shirt?: Texture
    pants?: Texture
    shoes?: Texture
}

export interface BackgroundTexture {
    background?: Texture
}

export type ComponentTexture = PartTexture & BackgroundTexture

type AssetInfo = {
    id: number,
    path: string,
}
type PartColorImportConfig = Record<string, AssetInfo>
type PartImportConfig = Record<string, PartColorImportConfig>
type PartGenderConfig = Partial<Record<AvatarGender, PartImportConfig>>
export type AvatarImportConfig = Partial<Record<AvatarPart, PartGenderConfig>>

export interface AvatarRenderInfo {
    partTexture: PartTexture,
    name: string,
    position: {x: number, y: number},
}

export interface CreateAvatarRequest {
    name: string
    parts: Record<AvatarPart, { id: number }>
}

export type BroadCastAvatarEventResponse = CreateAvatarRequest

