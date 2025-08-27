'use client'
import assetIndex from "../../assets/avatar/assetsIndex.json"
import { Assets } from "pixi.js";
import {useEffect, useState} from "react";

function extractFilePaths(obj: any, onExtract: (filePath: string) => void) {
    for (const key in obj) {
        const value = obj[key];

        if (typeof value === "string") {
            // base case: it's a file path
            onExtract(value)
        } else if (typeof value === "object" && value !== null) {
            // recursive case: dive deeper
            extractFilePaths(value, onExtract);
        }
    }
}

export const usePreloadAssets = () => {
    const [completed, setCompleted] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let isCancelled = false;

        const animationPaths: string[] = [];
        const selectionPaths: string[] = [];

        extractFilePaths(assetIndex, (filePath) => {
            animationPaths.push(`/assets/avatar/animation/${filePath}`);
            selectionPaths.push(`/assets/avatar/selection/${filePath}`);
        });

        const preloadImage = (path: string): Promise<void> => {
            return new Promise<void>((resolve, reject) => {
                const img = new window.Image();
                img.onload = () => resolve();
                img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
                img.src = path;
            });
        };

        const tasks: Promise<any>[] = [
            ...animationPaths.map((p) => Assets.load(p)),
            ...selectionPaths.map((p) => preloadImage(p)),
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


