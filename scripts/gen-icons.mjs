// One-off: rasterize app/icon.svg → favicon.ico (16/32/48) + apple-icon.png (180).
// Run from repo root: node scripts/gen-icons.mjs
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

const svg = readFileSync("app/icon.svg");

// High-res master so downsamples stay crisp.
const master = await sharp(svg, { density: 600 })
  .resize(1024, 1024, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

const png = (size) => sharp(master).resize(size, size).png().toBuffer();

// apple-touch icon
writeFileSync("app/apple-icon.png", await png(180));

// favicon.ico — wrap PNG entries (modern .ico supports PNG-compressed images)
const sizes = [16, 32, 48];
const buffers = await Promise.all(sizes.map(png));
const count = sizes.length;
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(count, 4);

const dir = Buffer.alloc(16 * count);
let offset = 6 + 16 * count;
buffers.forEach((buf, i) => {
  const s = sizes[i];
  const e = i * 16;
  dir.writeUInt8(s >= 256 ? 0 : s, e + 0); // width
  dir.writeUInt8(s >= 256 ? 0 : s, e + 1); // height
  dir.writeUInt8(0, e + 2); // palette
  dir.writeUInt8(0, e + 3); // reserved
  dir.writeUInt16LE(1, e + 4); // planes
  dir.writeUInt16LE(32, e + 6); // bpp
  dir.writeUInt32LE(buf.length, e + 8); // size
  dir.writeUInt32LE(offset, e + 12); // offset
  offset += buf.length;
});

writeFileSync("app/favicon.ico", Buffer.concat([header, dir, ...buffers]));

console.log("wrote app/favicon.ico (16/32/48) + app/apple-icon.png (180)");
