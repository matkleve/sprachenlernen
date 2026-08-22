/**
 * Minimal PNG reader — 8-bit, non-interlaced, colour type 2 (RGB) or 6 (RGBA).
 *
 * Here rather than as a dependency because the only consumer is
 * `texture-metrics.mjs`, a dev tool, and a decoder for the one format
 * Playwright and every screenshot tool emits is ~70 lines of `node:zlib`.
 * If a second consumer ever needs more (16-bit, palettes, interlacing), that is
 * the moment to reach for a real library instead of growing this.
 */
import { deflateSync, inflateSync } from "node:zlib";

export function readPng(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");

  let width = 0, height = 0, depth = 0, colour = 0, interlace = 0;
  const chunks = [];

  for (let p = 8; p < buffer.length; ) {
    const len = buffer.readUInt32BE(p);
    const type = buffer.toString("ascii", p + 4, p + 8);
    const data = buffer.subarray(p + 8, p + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      depth = data[8]; colour = data[9]; interlace = data[12];
    } else if (type === "IDAT") chunks.push(data);
    else if (type === "IEND") break;
    p += 12 + len;
  }

  if (depth !== 8) throw new Error(`unsupported bit depth ${depth} (need 8)`);
  if (colour !== 2 && colour !== 6) throw new Error(`unsupported colour type ${colour} (need 2 or 6)`);
  if (interlace !== 0) throw new Error("interlaced PNGs are not supported");

  const channels = colour === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(chunks));
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? cur[i - channels] : 0;
      const b = prev ? prev[i] : 0;
      const c = prev && i >= channels ? prev[i - channels] : 0;
      let v = line[i];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[i] = v & 0xff;
    }
  }
  return { width, height, channels, data: out };
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

/** Write 8-bit RGB PNG (filter 0). `rgba` length = width × height × 4. */
export function writeRgbPng(width, height, rgba) {
  const stride = width * 3;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    const row = y * (stride + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 4;
      const di = row + 1 + x * 3;
      raw[di] = rgba[si];
      raw[di + 1] = rgba[si + 1];
      raw[di + 2] = rgba[si + 2];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}
