"""Reprint the board and offline textures. Requires Node, Pillow and rsvg-convert."""
import base64
import io
import json
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
from xml.sax.saxutils import escape

from PIL import Image

DIST = Path(__file__).resolve().parents[1] / "dist"
ASSETS = DIST / "assets"
data = subprocess.check_output(
    ["node", "-e", "require('./game'); require('./board'); console.log(JSON.stringify([PimpaGame.cells, PimpaBoard]));"],
    cwd=DIST, text=True,
)
cells, board = json.loads(data)
W, H = board["width"], board["height"]
CW, CH = board["cellWidth"], board["cellHeight"]
ink, ivory, gold = "#174e4b", "#fff4ce", "#f2c876"
art = board["art"]
parts = []


def rect(x, y, w, h, r, fill, stroke="none", sw=1):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'


def circle(x, y, r, fill):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}"/>'


def path(d, fill, stroke="none", sw=1):
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round"/>'


def label(x, y, value, size, color, font="Georgia", italic=False):
    style = "italic" if italic else "normal"
    return f'<text x="{x}" y="{y}" font-family="{font}" font-style="{style}" font-weight="bold" font-size="{size}" text-anchor="middle" fill="{color}">{escape(str(value))}</text>'


def use(name, x, y, w, h, extra=""):
    return f'<svg x="{x}" y="{y}" width="{w}" height="{h}" viewBox="0 0 100 100" {extra}><use xlink:href="#{name}"/></svg>'


def sparkle(x, y, s, color):
    return f'<g transform="translate({x} {y}) scale({s})">{path("M0 -9 Q1 -1 8 0 Q1 1 0 10 Q-1 1 -8 0 Q-1 -1 0 -9Z", color)}</g>'


def branch(x, y, scale, rotation, color):
    leaves = path("M0 0 Q12 -9 42 -10", "none", color, 2)
    for dx, dy in [(8, -4), (17, -7), (27, -9)]:
        leaves += f'<g transform="translate({dx} {dy})">' + path("M0 0 Q-7 -13 2 -11 Q8 -8 0 0 M4 0 Q11 9 16 5 Q14 0 4 0", color) + "</g>"
    return f'<g transform="translate({x} {y}) rotate({rotation}) scale({scale})">{leaves}</g>'


# Put each illustration into the document once, even when the same character recurs.
defs = []
for name in sorted(set(art.values())):
    # librsvg installations vary in WebP support. PNG is used only inside the temporary print.
    with Image.open(ASSETS / "illustrations" / (name + ".webp")) as source:
        png = io.BytesIO()
        source.save(png, "PNG")
    data_url = "data:image/png;base64," + base64.b64encode(png.getvalue()).decode()
    defs.append(f'<image id="{name}" width="100" height="100" xlink:href="{data_url}"/>')

# The centre has its own tall crop of the theatre landscape.
with Image.open(ASSETS / "illustrations/bosco.webp") as source:
    ratio = (CW - 12) / (3 * CH - 12)
    crop_width = round(source.height * ratio)
    mid = source.width // 2
    center_image = source.crop((mid - crop_width // 2, 0, mid + crop_width // 2, source.height))
    png = io.BytesIO()
    center_image.save(png, "PNG")
    center_url = "data:image/png;base64," + base64.b64encode(png.getvalue()).decode()

parts += [rect(0, 0, W, H, 20, ink), rect(8, 8, W-16, H-16, 15, "none", gold, 2),
          rect(14, 14, W-28, H-28, 12, "none", "#72977d", 1),
          rect(22, 70, W-44, H-92, 17, "#f3dfac")]
for x in (55, 118, 180, 820, 882, 945):
    parts.append(sparkle(x, 42, 0.6 if x % 2 else 0.85, gold))
parts += [branch(223, 44, 1.7, 0, "#9ab898"), branch(777, 44, -1.7, 0, "#9ab898"),
          label(500, 53, "Il gioco dell’oca", 46, ivory, italic=True)]
# Local palettes pair the printed ink with shaded hills and foliage.
palettes = [
    ("#b9e3cf", "#87c6a6", "#55a083", "#235d50"),
    ("#f8c4a1", "#eda582", "#d88568", "#844e41"),
    ("#c6dff0", "#9dbfdb", "#7599c0", "#405879"),
    ("#f9df98", "#edc773", "#d9a853", "#785638"),
    ("#dfcce7", "#c7abd6", "#ad91bb", "#665175"),
]
color_order = [0,3,4,1,2,1,3,4,0,1,3,2,4,0,2,1,0,3,4,2,0,1,3,2,0,1,4,3,0,4,2,3]
for cell, tile in zip(cells, board["tiles"]):
    n = cell["n"]
    x, y = tile["x"], tile["y"]
    sky, far, near, accent = palettes[color_order[n]]
    special = str(n) in art
    parts.append(f'<g transform="translate({x:.2f} {y:.2f})">')
    parts += [rect(2, 3, CW-4, CH-4, 13, accent),
              rect(2, 1, CW-4, CH-5, 13, sky, "#786f53", 1)]
    defs.append(f'<clipPath id="tile{n}">{rect(4, 3, CW-8, CH-9, 11, "white")}</clipPath>')
    parts.append(f'<g clip-path="url(#tile{n})">')
    parts.append(circle(145 if n % 2 else 50, 50, 26, "#fff1bf"))
    parts += [path("M-5 124 Q38 69 81 102 T193 83 V189 H-5Z", far),
              path("M-4 153 Q55 111 100 134 T194 110 V190 H-4Z", near)]
    for j in range(9):
        gx = 7 + (29*j + 13*n) % 173
        gy = 142 + (13*j + 3*n) % 35
        parts.append(path(f"M{gx} {gy} l-2 -5 m2 5 l3 -7", "none", far, 2))
    parts.append(branch(11, 155, .8, -58, accent))
    if special:
        parts.append(use(art[str(n)], 44, 9, 122, 127))
        parts += [rect(11, 139, CW-22, 32, 14, ivory)]
        name = {4:"Corvo Nicola", 18:"La maga", 20:"Ragno Peppino", 27:"Zucca che ride", 31:"Arrivo"}.get(n, cell["name"])
        parts.append(label(CW/2, 161, name, 16 if len(name)>12 else 18, ink, "Trebuchet MS"))
        parts += [circle(30, 31, 25, ivory), circle(30, 31, 21, ink), label(30, 41, n, 27, ivory, "Trebuchet MS")]
    elif n == 0:
        parts += [path("M76 120 V33", "none", ink, 6),
                  path("M79 35 Q98 25 113 37 T142 34 L137 70 Q121 80 108 67 T79 67Z", "#ce5143", ink, 2),
                  label(CW/2, 159, "Partenza", 25, ink)]
    else:
        # An ornamental cartouche makes the next number visible from across the table.
        parts += [circle(94, 80, 48, far), circle(94, 76, 47, ivory),
                  circle(94, 76, 43, "none").replace('/>', f' stroke="{far}" stroke-width="2"/>'),
                  label(94, 96, n, 57, accent, "Trebuchet MS"),
                  sparkle(34, 70, .85, ivory), sparkle(150, 89, .64, ivory)]
    parts.append("</g></g>")
# Outgoing arrows straddle the gutter; they always point to the next actual space.
for n in range(len(cells)-1):
    here, there = board["tiles"][n:n+2]
    dx, dy = there["x"]-here["x"], there["y"]-here["y"]
    ax, ay = here["x"]+CW/2+dx/2, here["y"]+CH/2+dy/2
    angle = 0 if dx>1 else 180 if dx<-1 else 90 if dy>1 else -90
    parts.append(f'<g transform="translate({ax} {ay}) rotate({angle})">' + circle(0,0,10,ivory) +
                 path("M-4 -4 L2 0 -4 4", "none", ink, 3) + "</g>")

cx, cy = board["left"] + CW*2 + 4, board["top"] + CH*2 + 2
mw, mh = CW-8, CH*3-6
defs.append(f'<clipPath id="centre">{rect(cx,cy,mw,mh,16,"white")}</clipPath>')
parts.append(f'<g clip-path="url(#centre)"><image x="{cx}" y="{cy}" width="{mw}" height="{mh}" preserveAspectRatio="xMidYMid slice" xlink:href="{center_url}"/>')
parts += [path(f"M{cx} {cy}h{mw}v72q-{mw/2} 37 -{mw} 0Z", ink),
          label(cx+mw/2,cy+40,"Il bosco",30,ivory,italic=True),
          label(cx+mw/2,cy+65,"della maga",20,gold), "</g>",
          rect(cx,cy,mw,mh,16,"none",ink,3)]
svg = f'<svg width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs>{"".join(defs)}</defs>{"".join(parts)}</svg>'
board_file = ASSETS / "illustrazioni-tabellone.webp"
with TemporaryDirectory() as tmp:
    source = Path(tmp) / "print.svg"
    source.write_text(svg)
    raster = Path(tmp) / "print.png"
    subprocess.run(["rsvg-convert", "-w", "2800", "-o", str(raster), str(source)], check=True)
    with Image.open(raster) as print_image:
        print_image.save(board_file, quality=92, method=6)

# WebGL needs origin-clean images when launched directly from the Finder.
textures = {}
for file in [ASSETS / "table-wood.jpg", board_file, *sorted((ASSETS / "characters").glob("*.png"))]:
    mime = {".jpg": "jpeg", ".webp": "webp", ".png": "png"}[file.suffix]
    textures[file.relative_to(DIST).as_posix()] = f"data:image/{mime};base64," + base64.b64encode(file.read_bytes()).decode()
(ASSETS / "local-textures.js").write_text("/* Offline WebGL textures. Generated by render_board.py. */\nwindow.PimpaLocalTextures=" + json.dumps(textures, separators=(",", ":")) + ";\n")
