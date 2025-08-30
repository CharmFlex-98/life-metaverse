// rename-files.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folder = path.join(__dirname, "../../public/assets/avatar/animation");

let currentIndex = 0;

function renameFilesInDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach((file, index) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // recursively rename inside subfolders
            renameFilesInDir(fullPath);
        } else {
            const ext = path.extname(file);
            const base = path.basename(file, ext);

            // skip if already prefixed
            if (/^\d+_/.test(base)) return;

            const newName = `${currentIndex++}_${base}${ext}`;
            const newPath = path.join(dir, newName);

            fs.renameSync(fullPath, newPath);
            console.log(`Renamed: ${file} → ${newName}`);
        }
    });
}

renameFilesInDir(folder);
