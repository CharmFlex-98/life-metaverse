"use client"

import { useRef, useState, useMemo, useCallback, useEffect } from "react"
import { MainCanvas } from "@/app/avatar/ui/mainCanvas"
import AvatarSelector from "@/app/avatar/ui/AvatarSelector"
import { Parts } from "@/components/avatar/useAvatarAnimation"
import assetsIndex from "../../assets/avatar/assetsIndex.json"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Gender = "male" | "female" | "unisex"

const avatarPartsConfig: { key: Parts; label: string; autoSelect?: boolean }[] = [
    { key: "head", label: "Head", autoSelect: true },
    { key: "body", label: "Body", autoSelect: true },
    { key: "hair", label: "Hair" },
    { key: "shirt", label: "Shirt" },
    { key: "pants", label: "Pants" },
    { key: "shoes", label: "Shoes" },
]

export default function AvatarCustomizer() {
    const canvasContainerRef = useRef<HTMLDivElement>(null)
    const [selectedParts, setSelectedParts] = useState<Partial<Record<Parts, string>>>({})
    const [gender, setGender] = useState<Gender>("male")

    const filterByGender = useCallback((files: string[], gender: Gender) => {
        return files.filter((file) => {
            const prefix = file.split("/").pop()?.split("_")[0]
            return prefix === gender || prefix === "unisex"
        })
    }, [])

    // Reset when gender changes
    const onGenderChanged = useCallback((newGender: Gender) => {
        setGender(newGender)
        setSelectedParts({}) // reset first
    }, [])

    // When gender changes, auto-select default parts
    useEffect(() => {
        const defaults: Partial<Record<Parts, string>> = {}

        avatarPartsConfig.forEach(({ key, autoSelect }) => {
            if (autoSelect) {
                const available = filterByGender((assetsIndex as any)[key], gender)
                if (available.length > 0) {
                    defaults[key] = available[0] // auto pick the first option
                }
            }
        })

        if (Object.keys(defaults).length > 0) {
            setSelectedParts(defaults)
        }
    }, [gender, filterByGender])

    // Map over parts instead of repeating JSX
    const selectors = useMemo(() => {
        return avatarPartsConfig.map(({ key, label, autoSelect }) => (
            <AvatarSelector
                key={key}
                autoSelect={autoSelect}
                partsFileName={filterByGender((assetsIndex as any)[key], gender)}
                placeholder={`Select ${label}`}
                onSelected={(url) => {
                    console.log(url + " is selected")
                    setSelectedParts((prev) =>({ ...prev, [key]: url }))
                }}
                selectedFileName={selectedParts[key]}
            />
        ))
    }, [gender, filterByGender, selectedParts])

    return (
        <div className="relative h-[100vh] w-[100vw]">
            {/* Canvas fills the background */}
            <div ref={canvasContainerRef} className="h-full w-full">
                <MainCanvas parentNode={canvasContainerRef} avatarPartFileName={selectedParts} />
            </div>

            {/* Overlay selectors */}
            <div className="absolute top-0 right-0 flex flex-col items-center gap-2 p-4 rounded-lg shadow-lg bg-white/70">
                {/* Gender Selector */}
                <Select onValueChange={(val: Gender) => onGenderChanged(val)} value={gender}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Gender</SelectLabel>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="unisex">Unisex</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {/* Dynamic Avatar Part Selectors */}
                {selectors}
            </div>
        </div>
    )
}
