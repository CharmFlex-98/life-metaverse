import {useMemo} from "react";
import {extractFilePaths} from "@/app/core/preload";
import assetIndex from "../../assets/avatar/assetsIndex.json"
import Image from "next/image";

export function PreloadAvatarAssets() {
    const paths = useMemo(() => {
        const paths: string[] = []
        extractFilePaths(assetIndex, (url: string) => {
            paths.push(`assets/avatar/animation/${url}`)
        })

        return paths
    }, []);

    return (
        <>
            {paths.map((src) => (
                <Image
                    key={src}
                    src={`/${src}`}   // assumes your assets are under /public
                    alt=""
                    width={1}
                    height={1}
                    priority
                    className="hidden"
                />
            ))}
        </>
    );
}