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
    hair?: Texture | any
    head?: Texture | any
    body?: Texture | any
    shirt?: Texture | any
    pants?: Texture | any
    shoes?: Texture | any
}

export interface BackgroundTexture {
    background?: Texture | any
}

export type ComponentTexture = PartTexture & BackgroundTexture

type PartColorImportConfig = Record<string, string>
type PartImportConfig = Record<string, PartColorImportConfig>
type PartGenderConfig = Partial<Record<AvatarGender, PartImportConfig>>
export type AvatarImportConfig = Partial<Record<AvatarPart, PartGenderConfig>>

