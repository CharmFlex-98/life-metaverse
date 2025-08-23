"use client"

import {useCallback, useEffect, useState} from "react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {Button} from "@/components/ui/button";
import path from "path";


interface AvatarSelectionProps {
    placeholder: string,
    partsFileName: string[],
    selectedFileName?: string
    onSelected: (url: string) => void,
    autoSelect?: boolean
}
export default function AvatarSelector({ partsFileName, placeholder, selectedFileName, autoSelect = false, onSelected }: AvatarSelectionProps) {
    useEffect(() => {
        if (autoSelect) {
            onSelected(partsFileName[0])
        }
    }, [autoSelect]);

    useEffect(() => {
        console.log("placeHolder: " + placeholder + "; avatar selected filename: " + selectedFileName)
    }, [selectedFileName]);

    return (
        <div className="p-4">
            <Select defaultValue={autoSelect ? partsFileName[0] : undefined} value={selectedFileName ?? ""} onValueChange={(filename) => {
                onSelected(filename)
            }}>
                <SelectTrigger className="w-[200px] !h-16">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {partsFileName.map((filename) => (
                        <SelectItem key={filename} value={filename}>
                            <div className="flex items-center">
                                <Image src={"/assets/avatar/selection/" + filename} alt={filename} width={64} height={64} />
                                <span>{filename.split("/").pop()?.split(".")[0]}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

    )
}
