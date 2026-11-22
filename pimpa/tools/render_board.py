"""Reprint the board and offline textures. Requires Node, Pillow and rsvg-convert."""
import base64
import io
import json
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
from urllib.parse import quote_from_bytes
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

parts += [rect(0, 0, W, H, 20, ink), rect(8, 8, W-16, H-16, 15, "none", gold, 2),
          rect(14, 14, W-28, H-28, 12, "none", "#72977d", 1),
          rect(22, 70, W-44, H-92, 17, "#fffefb")]
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
# Print the spiral on white stock. Consecutive spaces share a flush edge;
# the broader white channels belong only between different stretches of track.
for n, tile in enumerate(board["tiles"]):
    outline = " ".join(f"{u*CW:.3f},{v*CH:.3f}" for u, v in tile["outline"])
    defs.append(f'<polygon id="shape{n}" points="{outline}"/>')
    defs.append(f'<clipPath id="tile{n}"><use xlink:href="#shape{n}"/></clipPath>')
    parts.append(f'<use x="{tile["x"]}" y="{tile["y"]}" xlink:href="#shape{n}" fill="{ink}" stroke="#47685f" stroke-width="3.5" stroke-linejoin="round"/>')

for cell, tile in zip(cells, board["tiles"]):
    n = cell["n"]
    x, y = tile["x"], tile["y"]
    sky, far, near, accent = palettes[color_order[n]]
    special = str(n) in art
    parts.append(f'<g transform="translate({x:.2f} {y:.2f})"><g clip-path="url(#tile{n})">')
    parts.append(rect(0, 0, CW, CH, 0, sky))
    parts.append(circle(145 if n % 2 else 50, 50, 26, "#fff1bf"))
    parts += [path("M-5 124 Q38 69 81 102 T193 83 V189 H-5Z", far),
              path("M-4 153 Q55 111 100 134 T194 110 V190 H-4Z", near)]
    for j in range(5):
        gx = 7 + (29*j + 13*n) % 173
        gy = 142 + (13*j + 3*n) % 35
        parts.append(path(f"M{gx} {gy} l-2 -5 m2 5 l3 -7", "none", far, 2))
    parts.append(branch(19, 150, .72, -58, accent))
    if special:
        parts.append(use(art[str(n)], 65, 25, 96, 99))
        parts.append(rect(27, 127, CW-54, 28, 14, ivory))
        name = {4:"Corvo Nicola", 18:"La maga", 20:"Ragno Peppino", 27:"Zucca che ride", 31:"Arrivo"}.get(n, cell["name"])
        parts.append(label(CW/2, 147, name, 15 if len(name)>12 else 17, ink, "Trebuchet MS"))
        parts += [circle(49, 53, 27, ivory), circle(49, 53, 24, ink), label(49, 64, n, 31, ivory, "Trebuchet MS")]
    elif n == 0:
        parts += [path("M76 113 V39", "none", ink, 6),
                  path("M79 35 Q98 25 113 37 T142 34 L137 70 Q121 80 108 67 T79 67Z", "#ce5143", ink, 2),
                  label(CW/2, 148, "Partenza", 25, ink)]
    else:
        # An ornamental cartouche makes the next number visible from across the table.
        parts += [circle(94, 95, 48, far), circle(94, 91, 47, ivory),
                  circle(94, 91, 43, "none").replace('/>', f' stroke="{far}" stroke-width="2"/>'),
                  label(94, 111, n, 58, accent, "Trebuchet MS"),
                  sparkle(34, 70, .85, ivory), sparkle(150, 89, .64, ivory)]
    parts.append("</g></g>")
# A hairline divides two consecutive colours. The arrow sits in the middle
# of that joint so it can never point across a white channel.
for n, (here, there) in enumerate(zip(board["tiles"], board["tiles"][1:])):
    dx, dy = there["x"]-here["x"], there["y"]-here["y"]
    ax, ay = here["x"]+CW/2+dx/2, here["y"]+CH/2+dy/2
    angle = 0 if dx>0 else 180 if dx<0 else 90 if dy>0 else -90
    # Clip the separator to the actual entrance of this space.
    seam = f"M{ax - here['x']} -1v{CH + 2}" if dx else f"M-1 {ay - here['y']}h{CW + 2}"
    parts.append(f'<g transform="translate({here["x"]} {here["y"]})" clip-path="url(#tile{n})">{path(seam, "none", "#fffefb", 5)}</g>')
    parts.append(f'<g transform="translate({ax} {ay}) rotate({angle})">' +
                 rect(-17,-12,34,24,12,ink,"#fff9e6",2) +
                 path("M-8 0H7 M1 -6 8 0 1 6", "none", "#fff9e6", 3.7) + "</g>")

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
    # Percent-encoded image bytes avoid key-shaped runs of Base64 in the published bundle.
    textures[file.relative_to(DIST).as_posix()] = f"data:image/{mime}," + quote_from_bytes(file.read_bytes(), safe="")
(ASSETS / "local-textures.js").write_text("/* Offline WebGL textures. Generated by render_board.py. */\nwindow.PimpaLocalTextures=" + json.dumps(textures, separators=(",", ":")) + ";\n")
