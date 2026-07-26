"""Generate WebP variants and OG social image for INESA public assets."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1] / "public"


def to_webp(
    src: Path,
    dest: Path | None = None,
    quality: int = 78,
    max_side: int | None = None,
) -> Path:
    dest = dest or src.with_suffix(".webp")
    img = Image.open(src)
    img = ImageOps.exif_transpose(img)
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if "A" in img.getbands() else "RGB")
    if max_side and max(img.size) > max_side:
        img.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    if dest.suffix.lower() == ".webp" and img.mode == "RGBA" and src.suffix.lower() in {
        ".jpg",
        ".jpeg",
    }:
        img = img.convert("RGB")
    img.save(dest, "WEBP", quality=quality, method=6)
    print(f"OK {src.relative_to(ROOT)} -> {dest.name} ({dest.stat().st_size // 1024}KB)")
    return dest


def main() -> None:
    to_webp(ROOT / "fondo.jpg", quality=72, max_side=1920)
    to_webp(ROOT / "fondo.jpg", ROOT / "fondo-mobile.webp", quality=70, max_side=960)
    to_webp(ROOT / "logo-inesa.png", quality=85, max_side=512)
    branding_fondo = ROOT / "images" / "branding" / "fondo.jpg"
    if branding_fondo.exists():
        to_webp(branding_fondo, quality=72, max_side=1920)
        to_webp(
            branding_fondo,
            ROOT / "images" / "branding" / "fondo-mobile.webp",
            quality=70,
            max_side=960,
        )

    # Hero / emblem logo layers (keep display sizes small for mobile LCP)
    layers = ROOT / "images" / "branding" / "logo-layers"
    if layers.exists():
        for name in ("logo-closed.png", "logo-open.png", "green-only.png"):
            src = layers / name
            if src.exists():
                to_webp(src, quality=82, max_side=600)
        emblem = layers / "emblem-closed.png"
        if emblem.exists():
            img = Image.open(emblem).convert("RGBA")
            side = min(img.size)
            img = img.crop((0, 0, side, side))
            img.thumbnail((128, 128), Image.Resampling.LANCZOS)
            dest = layers / "emblem-40.webp"
            img.save(dest, "WEBP", quality=85, method=6)
            img.save(layers / "emblem-40.png", "PNG", optimize=True)
            print(f"OK emblem-40 ({dest.stat().st_size // 1024}KB)")

    featured = ROOT / "images" / "gallery" / "featured"
    if featured.exists():
        for path in featured.glob("*.jpg"):
            to_webp(path, quality=75, max_side=1600)

    for folder in ("analysis", "institutional", "events"):
        directory = ROOT / "images" / "gallery" / folder
        if not directory.exists():
            continue
        for pattern in ("*.jpg", "*.JPG", "*.jpeg", "*.png", "*.PNG"):
            for path in directory.glob(pattern):
                try:
                    to_webp(path, quality=72, max_side=1400)
                except Exception as exc:  # noqa: BLE001
                    print(f"FAIL {path}: {exc}")

    # OG image 1200x630
    og = Image.new("RGB", (1200, 630), (47, 42, 38))
    draw = ImageDraw.Draw(og)
    draw.rectangle([0, 0, 1200, 12], fill=(233, 79, 29))
    draw.rectangle([0, 618, 1200, 630], fill=(133, 170, 12))
    logo = Image.open(ROOT / "logo-inesa.png").convert("RGBA")
    logo.thumbnail((420, 420), Image.Resampling.LANCZOS)
    lx = (1200 - logo.width) // 2
    ly = (630 - logo.height) // 2 - 20
    og.paste(logo, (lx, ly), logo)
    og_jpg = ROOT / "og-image.jpg"
    og.save(og_jpg, "JPEG", quality=88, optimize=True)
    og.save(ROOT / "og-image.webp", "WEBP", quality=82, method=6)
    print(f"OG {og_jpg.stat().st_size // 1024}KB")
    print("done")


if __name__ == "__main__":
    main()
