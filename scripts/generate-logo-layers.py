"""Generate logo hover layers from the original INESA PNG."""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "logo-inesa.png"
OUT = ROOT / "public" / "images" / "branding" / "logo-layers"

GX, GY = 553, 327
RX, RY = 44, 46

# Orange shell sample points (radians, radius)
LOBES = (
    (-1.1, 108),
    (-2.2, 108),
    (1.7, 104),
)


def in_core_ellipse(x: int, y: int) -> bool:
    dx = (x - GX) / RX
    dy = (y - GY) / RY
    return dx * dx + dy * dy <= 1.0


def is_green_pixel(r: int, g: int, b: int) -> bool:
    return g > 130 and r < 210 and b < 150 and g > r + 15


def sample_shell_color(
    pixels,
    w: int,
    h: int,
    x: int,
    y: int,
) -> tuple[int, int, int, int]:
    angles = [math.degrees(math.atan2(y - GY, x - GX))]
    for offset in (-18, 18, -36, 36):
        angles.append(angles[0] + offset)

    for angle in angles:
        rad = math.radians(angle)
        for step in range(GR + 6, 160, 4):
            sx = int(GX + math.cos(rad) * step)
            sy = int(GY + math.sin(rad) * step)
            if sx < 0 or sy < 0 or sx >= w or sy >= h:
                continue
            r, g, b, a = pixels[sx, sy]
            if a < 40:
                continue
            if is_green_pixel(r, g, b):
                continue
            if r > 210 and g > 200 and b > 160:
                continue
            return r, g, b, a

    return 228, 126, 28, 255


def ring_color_map(pixels, w: int, h: int) -> dict[int, tuple[int, int, int, int]]:
    ring: dict[int, list[tuple[int, int, int, int]]] = {}
    for angle in range(0, 360, 2):
        rad = math.radians(angle)
        for step in range(GR + 10, GR + 70, 2):
            sx = int(GX + math.cos(rad) * step)
            sy = int(GY + math.sin(rad) * step)
            if sx < 0 or sy < 0 or sx >= w or sy >= h:
                continue
            r, g, b, a = pixels[sx, sy]
            if a < 40 or is_green_pixel(r, g, b):
                continue
            if r > 215 and g > 195:
                continue
            ring.setdefault(angle, []).append((r, g, b, a))
            break

    averaged: dict[int, tuple[int, int, int, int]] = {}
    for angle, samples in ring.items():
        r = sum(s[0] for s in samples) // len(samples)
        g = sum(s[1] for s in samples) // len(samples)
        b = sum(s[2] for s in samples) // len(samples)
        a = sum(s[3] for s in samples) // len(samples)
        averaged[angle] = (r, g, b, a)
    return averaged


def lobe_sample(pixels, w: int, h: int, x: int, y: int) -> tuple[int, int, int, int]:
    angle = math.atan2(y - GY, x - GX)
    lobe_angle, lobe_r = min(LOBES, key=lambda item: abs(angle - item[0]))
    sx = int(GX + math.cos(lobe_angle) * lobe_r)
    sy = int(GY + math.sin(lobe_angle) * lobe_r)
    sx = max(0, min(w - 1, sx))
    sy = max(0, min(h - 1, sy))
    return pixels[sx, sy]


def build_logo_closed(source: Image.Image) -> Image.Image:
    """Full logo with the green core filled by cloning the orange shell inward."""
    closed = source.copy()
    px = closed.load()
    w, h = closed.size

    for y in range(h):
        for x in range(w):
            if not in_core_ellipse(x, y):
                continue
            sr, sg, sb, sa = lobe_sample(px, w, h, x, y)
            _, _, _, a = px[x, y]
            if a < 20:
                continue
            dx = (x - GX) / RX
            dy = (y - GY) / RY
            depth = 1 - (dx * dx + dy * dy) * 0.1
            px[x, y] = (
                min(255, int(sr * depth)),
                min(255, int(sg * depth)),
                min(255, int(sb * depth)),
                a,
            )

    return closed.filter(ImageFilter.GaussianBlur(radius=0.45))


def build_green_only(source: Image.Image) -> Image.Image:
    w, h = source.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    src_px = source.load()
    out_px = layer.load()

    for y in range(h):
        for x in range(w):
            if not in_core_ellipse(x, y):
                continue
            r, g, b, a = src_px[x, y]
            if a < 20:
                continue
            dx = (x - GX) / RX
            dy = (y - GY) / RY
            feather = max(0.0, 1 - (dx * dx + dy * dy))
            out_px[x, y] = (r, g, b, int(a * feather))

    return layer


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    source = Image.open(SRC).convert("RGBA")

    source.save(OUT / "logo-open.png")
    build_logo_closed(source).save(OUT / "logo-closed.png")
    build_green_only(source).save(OUT / "green-only.png")

    print(f"Generated logo-open, logo-closed, green-only in {OUT}")


if __name__ == "__main__":
    main()