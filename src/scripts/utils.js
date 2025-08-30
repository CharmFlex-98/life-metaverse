// rename-files.js
const fs = require("fs");
const path = require("path");

const folder = path.join(__dirname, "public/assets/avatar/animation");

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

            const newName = `${index}_${base}${ext}`;
            const newPath = path.join(dir, newName);

            fs.renameSync(fullPath, newPath);
            console.log(`Renamed: ${file} → ${newName}`);
        }
    });
}

renameFilesInDir(folder);
