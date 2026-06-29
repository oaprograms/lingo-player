// Renames the NW.js host an addon expects, so the portable launcher can be
// called something other than "nw.exe".
//
// Native NW.js addons (here WebChimera.js.node) import host symbols from a
// module whose name is hard-coded as "nw.exe" in their PE import table. If you
// just rename nw.exe, the addon fails to load ("specified module could not be
// found") and the app shows a blank window. This patches the addon's import
// descriptor to point at a new host name written into the PE header padding
// (an always-zero, mapped, unreferenced region), so RVA == file offset there.
//
// Usage: node patch-nw-name.js <path-to-.node> <NewHostName.exe>
// After patching, rename the nw.exe copy to the same <NewHostName.exe>.

const fs = require("fs");

const file = process.argv[2];
const newName = process.argv[3];
if (!file || !newName) {
    console.error("usage: node patch-nw-name.js <path-to-.node> <NewName.exe>");
    process.exit(1);
}

const b = fs.readFileSync(file);

const peOff = b.readUInt32LE(0x3c);
if (b.toString("ascii", peOff, peOff + 4) !== "PE\0\0") { console.error("not a PE file"); process.exit(1); }
const numSec = b.readUInt16LE(peOff + 6);
const optSize = b.readUInt16LE(peOff + 20);
const optOff = peOff + 24;
const is64 = b.readUInt16LE(optOff) === 0x20b;
const sizeOfHeaders = b.readUInt32LE(optOff + 60);
const ddOff = optOff + (is64 ? 112 : 96);
const impRVA = b.readUInt32LE(ddOff + 8);

const secTableOff = optOff + optSize;
const secs = [];
for (let i = 0; i < numSec; i++) {
    const s = secTableOff + i * 40;
    secs.push({ vaddr: b.readUInt32LE(s + 12), vsize: b.readUInt32LE(s + 8), roff: b.readUInt32LE(s + 20), rsize: b.readUInt32LE(s + 16) });
}
const rva2off = r => { for (const s of secs) if (r >= s.vaddr && r < s.vaddr + Math.max(s.vsize, s.rsize)) return r - s.vaddr + s.roff; return -1; };

// find the import descriptor whose DLL name == "nw.exe"
let descOff = -1;
for (let d = rva2off(impRVA); ; d += 20) {
    const nameRVA = b.readUInt32LE(d + 12);
    if (nameRVA === 0 && b.readUInt32LE(d) === 0) break;
    const no = rva2off(nameRVA);
    if (no < 0) continue;
    let end = no; while (b[end] !== 0) end++;
    if (b.toString("ascii", no, end).toLowerCase() === "nw.exe") { descOff = d; break; }
}
if (descOff < 0) {
    if (b.includes(Buffer.from(newName))) { console.log("already patched to " + newName); process.exit(0); }
    console.error("no \"nw.exe\" import found - nothing to patch"); process.exit(1);
}

// find zero padding in the PE header (between the section table and SizeOfHeaders)
const need = newName.length + 1;
const secTableEnd = secTableOff + numSec * 40;
let cave = -1;
for (let i = secTableEnd; i < sizeOfHeaders - need; i++) {
    let ok = true;
    for (let j = 0; j < need + 2; j++) if (b[i + j] !== 0) { ok = false; break; }
    if (ok) { cave = i; break; }
}
if (cave < 0) { console.error("no header padding large enough for new name"); process.exit(1); }

b.write(newName + "\0", cave, "ascii");
b.writeUInt32LE(cave, descOff + 12); // header region is identity-mapped: RVA == file offset
fs.writeFileSync(file, b);
console.log('patched host import "nw.exe" -> "' + newName + '"');
