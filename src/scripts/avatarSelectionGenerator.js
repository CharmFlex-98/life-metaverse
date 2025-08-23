// avatarSelectionGenerator.js
import sharp from "sharp";
import fs from "fs";
import path from "path";

const avatarSelectionAssetLoaderPrefix = "assets/avatar/selection";
const assetsRelativePath = `public/assets/avatar/animation`;
const assetsDir = path.resolve(assetsRelativePath);
const outputDir = path.resolve("public/assets/avatar/selection");
const indexOutput = path.resolve("src/assets/avatar/assetsIndex.json");

// Crop rectangle (adjust as needed)
const cropOptions = { left: 0, top: 1536, width: 64, height: 64 };

// Ensure output root exists
fs.mkdirSync(outputDir, { recursive: true });

// Recursively collect all file paths
function collectFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(collectFiles(fullPath)); // recurse
    } else if (/\.(jpg|jpeg|png)$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

// Crop and save images
async function processImages() {
  const files = collectFiles(assetsDir);

  const tasks = files.map(async (filePath) => {
    const relativePath = path.relative(assetsDir, filePath); // keep folder structure
    const destPath = path.join(outputDir, relativePath);

    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    try {
      await sharp(filePath).extract(cropOptions).toFile(destPath);
      console.log(`✅ Cropped: ${relativePath}`);
    } catch (err) {
      console.error(`❌ Error with ${relativePath}:`, err.message);
    }
  });

  await Promise.all(tasks);
}

// Parse filename convention: part/gender_item_color.png
function parseFilename(relativePath) {
  const [part, filename] = [relativePath.split("/")[0], path.basename(relativePath, path.extname(relativePath))];

  const [gender, ...rest] = filename.split("_");
  const color = rest.pop();
  const itemName = rest.join("_");

  return { part, gender, itemName, color, relativePath };
}

// Build structured assets index
function buildIndex() {
  const assetsIndex = {};

  function walkDirIndex(dir, base = "") {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(base, entry.name);

      if (entry.isDirectory()) {
        walkDirIndex(fullPath, relativePath);
      } else if (/\.(png|jpg|jpeg)$/i.test(entry.name)) {
        const cleanPath = relativePath.replace(/\\/g, "/");
        const { part, gender, itemName, color } = parseFilename(cleanPath);

        if (!assetsIndex[part]) assetsIndex[part] = {};
        if (!assetsIndex[part][gender]) assetsIndex[part][gender] = {};
        if (!assetsIndex[part][gender][itemName]) assetsIndex[part][gender][itemName] = {};

        // Save final cropped path prefixed for loader usage
        assetsIndex[part][gender][itemName][color] = `${avatarSelectionAssetLoaderPrefix}/${cleanPath}`;
      }
    });
  }

  walkDirIndex(outputDir);

  fs.mkdirSync(path.dirname(indexOutput), { recursive: true });
  fs.writeFileSync(indexOutput, JSON.stringify(assetsIndex, null, 2));

  console.log("📦 Generated structured assetsIndex.json");
}

// Run everything
(async () => {
  await processImages(); // keep crop step
  buildIndex(); // build structured index
})();
