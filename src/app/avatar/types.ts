import {Texture} from "pixi.js";

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

type PartColorImportConfig = Record<string, string>
type PartImportConfig = Record<string, PartColorImportConfig>
type PartGenderConfig = Partial<Record<AvatarGender, PartImportConfig>>
export type AvatarImportConfig = Partial<Record<AvatarPart, PartGenderConfig>>

