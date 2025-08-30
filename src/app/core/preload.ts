'use client'
import assetIndex from "../../assets/avatar/assetsIndex.json"
import { Assets } from "pixi.js";
import {useEffect, useState} from "react";
import {base} from "next/dist/build/webpack/config/blocks/base";

export function extractFilePaths(
    obj: unknown,
    onExtract: (filePath: string) => void
) {
    if (obj && typeof obj === "object") {
        for (const key in obj as Record<string, unknown>) {
            const value = (obj as Record<string, unknown>)[key];

            if (typeof value === "string") {
                onExtract(value);
            } else if (typeof value === "object" && value !== null) {
                extractFilePaths(value, onExtract);
            }
        }
    }
}

const assetIdToAssetMap = new Map<number, string>();

const getById = (id: number) => {
    return assetIdToAssetMap.get(id)
}

const usePreloadAssets = () => {
    const [completed, setCompleted] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let isCancelled = false;

        const animationPaths: string[] = [];
        const cleanPaths: string[] = []

        extractFilePaths(assetIndex, (filePath) => {
            animationPaths.push(`/assets/avatar/animation/${filePath}`);
            cleanPaths.push(filePath)
        });

        cleanPaths.forEach((path) => {
            const basePath = path.split("/").pop()
            const index = Number(basePath?.split("_")?.[0])
            if (index && basePath) {
                assetIdToAssetMap.set(index, path)
            }
        })


        const tasks: Promise<void>[] = [
            ...animationPaths.map((p) => Assets.load(p)),
        ];

        let loadedCount = 0;
        tasks.forEach((task) =>
            task.finally(() => {
                loadedCount++;
                if (!isCancelled) {
                    setProgress(Math.round((loadedCount / tasks.length) * 100));
                }
            })
        );

        Promise.all(tasks)
            .then(() => {
                if (!isCancelled) {
                    console.log("✅ All avatar assets loaded");
                    setCompleted(true);
                }
            })
            .catch((err) => console.error("❌ Asset preload failed:", err));

        return () => {
            // prevents state update if unmounted
            isCancelled = true;
        };
    }, []);

    return { completed, progress };
};

export { usePreloadAssets, getById }


