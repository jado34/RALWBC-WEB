/**
 * RALWBC Image Optimizer
 * ─────────────────────────────────────────────────────────────────────────
 * Run:  npm run optimize-images
 *
 * What it does:
 *  - Scans /public (and subfolders) for JPEG/PNG files
 *  - Skips files already under 300 KB (already optimised)
 *  - Resizes large images so the longest side is max 900 px
 *  - Re-saves at 82% JPEG quality via Windows System.Drawing (no extra deps)
 *  - Prints a before/after size summary for every file processed
 *
 * Workflow: drop new images into /public, then run:
 *   npm run optimize-images
 */

import { execSync }                       from 'child_process';
import { readdirSync, statSync,
         existsSync, writeFileSync,
         unlinkSync }                     from 'fs';
import { join, extname, relative,
         resolve }                        from 'path';
import { tmpdir }                         from 'os';

const PUBLIC_DIR    = resolve(process.cwd(), 'public');
const MAX_DIMENSION = 900;   // px — longest side cap
const JPEG_QUALITY  = 82;    // 0–100
const SKIP_BELOW_KB = 300;   // already-small files are skipped
const IMAGE_EXTS    = new Set(['.jpg', '.jpeg', '.png']);

// ── Recursively collect image paths ──────────────────────────────────────
function collectImages(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectImages(full, out);
    } else if (IMAGE_EXTS.has(extname(entry).toLowerCase())) {
      out.push({ path: full, sizeKB: Math.round(statSync(full).size / 1024) });
    }
  }
  return out;
}

// ── Write & run a temp .ps1 file (avoids all quote-escaping hell) ─────────
function optimiseViaPowerShell(filePath) {
  const ps1 = join(tmpdir(), `ralwbc_opt_${Date.now()}.ps1`);

  const script = `
Add-Type -AssemblyName System.Drawing
$src   = '${filePath.replace(/'/g, "''")}'
$img   = [System.Drawing.Image]::FromFile($src)
$w     = $img.Width
$h     = $img.Height
$ratio = [Math]::Min(${MAX_DIMENSION} / [Math]::Max($w, $h), 1.0)
$nw    = [int]($w * $ratio)
$nh    = [int]($h * $ratio)
$bmp   = New-Object System.Drawing.Bitmap($nw, $nh)
$g     = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g.DrawImage($img, 0, 0, $nw, $nh)
$g.Dispose()
$img.Dispose()
$codec    = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatDescription -eq 'JPEG' }
$ep       = New-Object System.Drawing.Imaging.EncoderParameters(1)
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]${JPEG_QUALITY})
$bmp.Save($src, $codec, $ep)
$bmp.Dispose()
Write-Output "$nw $nh"
`.trim();

  writeFileSync(ps1, script, 'utf8');
  try {
    const out = execSync(
      `powershell -NoProfile -ExecutionPolicy Bypass -File "${ps1}"`,
      { encoding: 'utf8', timeout: 60000 }
    ).trim();
    return out; // e.g. "622 800"
  } finally {
    try { unlinkSync(ps1); } catch (_) {}
  }
}

// ── Main ─────────────────────────────────────────────────────────────────
console.log('\n🖼  RALWBC Image Optimizer\n' + '─'.repeat(54));

if (!existsSync(PUBLIC_DIR)) {
  console.error('❌  /public directory not found. Run from the project root.');
  process.exit(1);
}

const all       = collectImages(PUBLIC_DIR);
const toProcess = all.filter(f => f.sizeKB >= SKIP_BELOW_KB);
const skipped   = all.length - toProcess.length;

console.log(`Found ${all.length} image(s) total — skipping ${skipped} already under ${SKIP_BELOW_KB} KB\n`);

if (toProcess.length === 0) {
  console.log('✅  All images are already optimised!\n');
  process.exit(0);
}

let totalSavedKB = 0;

for (const file of toProcess) {
  const rel = relative(PUBLIC_DIR, file.path);
  process.stdout.write(`  ⏳  ${rel} … `);

  try {
    const dims      = optimiseViaPowerShell(file.path);
    const [nw, nh]  = dims.split(' ');
    const newSizeKB = Math.round(statSync(file.path).size / 1024);
    const savedKB   = file.sizeKB - newSizeKB;
    totalSavedKB   += Math.max(savedKB, 0);

    console.log(`✔`);
    console.log(`     ${file.sizeKB} KB  →  ${newSizeKB} KB  (saved ${savedKB} KB)  [${nw}×${nh} px]\n`);
  } catch (err) {
    console.log(`✖`);
    console.error(`     Error: ${err.message}\n`);
  }
}

console.log('─'.repeat(54));
console.log(`✅  Done!  Total space saved: ${(totalSavedKB / 1024).toFixed(1)} MB\n`);
