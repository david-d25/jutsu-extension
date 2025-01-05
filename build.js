const fs = require("fs-extra");
const path = require("path");
const sass = require("sass");
const esbuild = require("esbuild");
const archiver = require("archiver");

const srcDir = path.resolve(__dirname, "src");
const buildDir = path.resolve(__dirname, "build");
const outputDir = path.resolve(buildDir, "output");
const outputZip = path.resolve(buildDir, "extension.zip");

console.log("Cleaning build directory");
if (fs.existsSync(buildDir)) {
  fs.rmSync(buildDir, { recursive: true });
}
fs.mkdirSync(buildDir);
fs.mkdirSync(outputDir);

console.log("Compiling SCSS");
const scssPath = path.join(srcDir, "style.scss");
const cssPath = path.join(outputDir, "style.css");
const result = sass.compile(scssPath);
fs.writeFileSync(cssPath, result.css);

console.log("Bundling JS");
esbuild.buildSync({
  entryPoints: [path.join(srcDir, "content.js")],
  bundle: true,
  minify: true,
  outfile: path.join(outputDir, "content.js"),
});

console.log("Copying static files");
const staticFiles = ["manifest.json", "popup.html", "popup.js", "background.js", "icons"];
staticFiles.forEach((file) => {
  fs.copySync(path.join(srcDir, file), path.join(outputDir, file));
});

console.log("Creating ZIP archive");
const output = fs.createWriteStream(outputZip);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  console.log(`ZIP file created: ${outputZip} (${archive.pointer()} bytes)`);
});
archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(outputDir, false);
archive.finalize();
