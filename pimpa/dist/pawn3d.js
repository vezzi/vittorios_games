(() => {
  "use strict";

  // Pixel contours sampled from the opaque cut lines of the four print assets.
  // Keeping these here also allows the pieces to work offline without reading a canvas.
  const pieces = {
    pimpa: {
      width: 289,
      height: 400,
      color: 0xca3738,
      outline: [
        [188, 4],
        [174, 1],
        [157, 2],
        [144, 6],
        [134, 12],
        [120, 27],
        [107, 58],
        [94, 70],
        [67, 84],
        [43, 99],
        [30, 112],
        [24, 123],
        [21, 134],
        [21, 144],
        [24, 155],
        [28, 162],
        [36, 171],
        [46, 178],
        [68, 185],
        [64, 201],
        [39, 240],
        [32, 255],
        [29, 268],
        [14, 274],
        [6, 282],
        [2, 292],
        [1, 300],
        [3, 309],
        [10, 319],
        [20, 325],
        [23, 341],
        [27, 349],
        [34, 357],
        [22, 368],
        [19, 375],
        [19, 384],
        [21, 388],
        [27, 393],
        [50, 397],
        [115, 397],
        [144, 393],
        [208, 394],
        [220, 392],
        [226, 389],
        [230, 384],
        [231, 375],
        [229, 368],
        [221, 358],
        [206, 350],
        [190, 346],
        [196, 337],
        [202, 322],
        [203, 303],
        [200, 291],
        [194, 279],
        [180, 263],
        [189, 233],
        [191, 231],
        [222, 220],
        [242, 217],
        [255, 213],
        [268, 202],
        [276, 199],
        [279, 196],
        [286, 184],
        [286, 173],
        [283, 167],
        [277, 161],
        [262, 155],
        [238, 156],
        [206, 169],
        [192, 169],
        [185, 167],
        [187, 153],
        [194, 143],
        [219, 147],
        [237, 143],
        [245, 138],
        [250, 132],
        [253, 124],
        [261, 117],
        [264, 111],
        [265, 96],
        [271, 84],
        [270, 72],
        [265, 63],
        [259, 57],
        [246, 51],
        [230, 48],
        [219, 37],
        [210, 20],
        [201, 11],
      ],
    },
    tito: {
      width: 232,
      height: 400,
      color: 0x447bbc,
      outline: [
        [210, 16],
        [203, 14],
        [189, 14],
        [175, 21],
        [168, 22],
        [151, 7],
        [141, 3],
        [129, 1],
        [106, 4],
        [89, 12],
        [82, 17],
        [66, 35],
        [57, 56],
        [55, 70],
        [28, 108],
        [20, 124],
        [16, 140],
        [18, 159],
        [26, 172],
        [33, 178],
        [49, 184],
        [50, 186],
        [39, 208],
        [32, 231],
        [31, 241],
        [29, 243],
        [14, 243],
        [6, 251],
        [2, 261],
        [2, 278],
        [10, 294],
        [19, 302],
        [36, 308],
        [49, 325],
        [36, 351],
        [34, 366],
        [38, 377],
        [47, 386],
        [54, 390],
        [80, 397],
        [108, 396],
        [121, 392],
        [129, 387],
        [142, 390],
        [162, 390],
        [180, 384],
        [187, 377],
        [190, 371],
        [191, 357],
        [185, 343],
        [173, 333],
        [159, 329],
        [158, 325],
        [160, 314],
        [171, 296],
        [175, 281],
        [176, 254],
        [171, 226],
        [174, 223],
        [179, 225],
        [188, 225],
        [200, 219],
        [212, 202],
        [213, 183],
        [207, 169],
        [196, 159],
        [177, 153],
        [163, 154],
        [160, 149],
        [159, 137],
        [163, 133],
        [188, 129],
        [205, 121],
        [217, 110],
        [225, 97],
        [228, 88],
        [228, 71],
        [225, 61],
        [229, 53],
        [229, 38],
        [223, 26],
      ],
    },
    colombina: {
      width: 339,
      height: 400,
      color: 0x7d9a56,
      outline: [
        [189, 4],
        [178, 2],
        [148, 3],
        [125, 11],
        [107, 24],
        [93, 42],
        [86, 56],
        [82, 70],
        [82, 80],
        [91, 92],
        [93, 102],
        [89, 106],
        [74, 105],
        [58, 108],
        [40, 117],
        [25, 131],
        [11, 154],
        [5, 171],
        [1, 195],
        [2, 217],
        [9, 242],
        [20, 263],
        [37, 285],
        [54, 301],
        [76, 317],
        [98, 329],
        [105, 331],
        [108, 334],
        [112, 360],
        [107, 364],
        [87, 371],
        [77, 381],
        [78, 391],
        [86, 397],
        [107, 397],
        [141, 390],
        [183, 397],
        [204, 397],
        [214, 391],
        [216, 383],
        [211, 374],
        [204, 370],
        [177, 362],
        [180, 341],
        [185, 337],
        [204, 332],
        [229, 321],
        [246, 310],
        [264, 293],
        [284, 263],
        [291, 245],
        [296, 219],
        [295, 188],
        [287, 159],
        [275, 135],
        [256, 107],
        [254, 99],
        [266, 98],
        [326, 103],
        [333, 100],
        [336, 96],
        [336, 88],
        [331, 81],
        [267, 55],
        [246, 49],
        [234, 32],
        [223, 21],
        [211, 13],
      ],
    },
    olivia: {
      width: 376,
      height: 400,
      color: 0xe88931,
      outline: [
        [299, 5],
        [293, 2],
        [279, 2],
        [273, 4],
        [254, 15],
        [235, 30],
        [214, 22],
        [187, 21],
        [171, 25],
        [151, 36],
        [135, 51],
        [123, 70],
        [118, 86],
        [117, 109],
        [120, 123],
        [126, 134],
        [139, 146],
        [159, 154],
        [162, 157],
        [161, 161],
        [153, 168],
        [94, 197],
        [70, 214],
        [56, 215],
        [41, 208],
        [33, 199],
        [28, 196],
        [21, 197],
        [10, 208],
        [3, 223],
        [1, 237],
        [3, 247],
        [7, 255],
        [7, 271],
        [12, 283],
        [28, 301],
        [53, 319],
        [73, 328],
        [72, 332],
        [49, 352],
        [33, 370],
        [30, 376],
        [30, 382],
        [35, 388],
        [58, 388],
        [74, 397],
        [81, 398],
        [98, 387],
        [126, 385],
        [132, 380],
        [133, 371],
        [124, 360],
        [105, 348],
        [105, 345],
        [110, 336],
        [150, 333],
        [176, 326],
        [179, 327],
        [179, 332],
        [176, 339],
        [176, 349],
        [182, 357],
        [215, 377],
        [225, 377],
        [237, 369],
        [257, 369],
        [264, 364],
        [265, 354],
        [261, 346],
        [268, 340],
        [270, 336],
        [269, 328],
        [265, 324],
        [257, 321],
        [223, 318],
        [215, 315],
        [212, 311],
        [230, 297],
        [236, 290],
        [246, 272],
        [249, 262],
        [278, 252],
        [299, 239],
        [307, 230],
        [310, 224],
        [311, 215],
        [351, 194],
        [369, 176],
        [374, 163],
        [371, 153],
        [367, 149],
        [361, 147],
        [348, 147],
        [330, 152],
        [329, 150],
        [332, 144],
        [331, 132],
        [322, 125],
        [313, 124],
        [296, 129],
        [276, 140],
        [257, 154],
        [238, 135],
        [232, 125],
        [232, 118],
        [250, 123],
        [281, 125],
        [290, 122],
        [296, 116],
        [298, 107],
        [293, 96],
        [285, 89],
        [266, 80],
        [265, 78],
        [289, 57],
        [304, 34],
        [307, 19],
        [304, 10],
      ],
    },
  };

  const bodyHeight = 0.915;
  const boardThickness = 0.035;
  const slotWidth = boardThickness + 0.003;
  const slotHeight = 0.08;

  function cutout(THREE, piece, texture) {
    const shape = new THREE.Shape();
    const unit = bodyHeight / piece.height;
    piece.outline.forEach(([px, py], index) => {
      const x = (px + 0.5 - piece.width / 2) * unit;
      const y = (piece.height - py - 0.5) * unit;
      if (index === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: boardThickness,
      bevelEnabled: true,
      bevelThickness: 0.0012,
      bevelSize: 0.0012,
      bevelSegments: 1,
    });

    // ExtrudeGeometry packs back and front triangles in its first material group.
    // The caps share print registration, so the reverse is mirrored like a two-sided cutout.
    const [caps, rim] = geometry.groups;
    const oneFace = caps.count / 2;
    geometry.clearGroups();
    geometry.addGroup(caps.start, oneFace, 1);
    geometry.addGroup(caps.start + oneFace, oneFace, 0);
    geometry.addGroup(rim.start, rim.count, 2);
    const positions = geometry.getAttribute("position");
    const uv = geometry.getAttribute("uv");
    for (let i = caps.start; i < caps.start + caps.count; i++) {
      const u = positions.getX(i) / (piece.width * unit) + 0.5;
      const v = positions.getY(i) / bodyHeight;
      uv.setXY(i, u, texture.flipY ? v : 1 - v);
    }
    geometry.translate(0, 0.105, -boardThickness / 2);

    const print = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.94,
      alphaTest: 0.28,
    });
    const reverse = print.clone();
    reverse.color.setHex(0xf4ebdf);
    const paperEdge = new THREE.MeshStandardMaterial({
      color: 0xd3b68f,
      roughness: 1,
    });
    const mesh = new THREE.Mesh(geometry, [print, reverse, paperEdge]);
    mesh.name = "Sagoma stampata";
    return mesh;
  }

  function foot(THREE, width, height, topSlot, ink, paperEdge) {
    const shape = new THREE.Shape();
    const half = width / 2;
    const slot = slotWidth / 2;
    shape.moveTo(-half, 0);
    if (!topSlot) {
      shape.lineTo(-slot, 0);
      shape.lineTo(-slot, slotHeight);
      shape.lineTo(slot, slotHeight);
      shape.lineTo(slot, 0);
    }
    shape.lineTo(half, 0);
    const end = topSlot ? slot : 0;
    shape.bezierCurveTo(
      half * 0.95,
      height * 0.53,
      half * 0.63,
      height,
      end,
      height,
    );
    if (topSlot) {
      shape.lineTo(slot, slotHeight);
      shape.lineTo(-slot, slotHeight);
      shape.lineTo(-slot, height);
    }
    shape.bezierCurveTo(
      -half * 0.63,
      height,
      -half * 0.95,
      height * 0.53,
      -half,
      0,
    );
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: boardThickness,
      bevelEnabled: false,
      curveSegments: 16,
    });
    geometry.translate(0, 0, -boardThickness / 2);
    return new THREE.Mesh(geometry, [ink, paperEdge]);
  }

  function create(THREE, texture, id) {
    const piece = pieces[id];
    if (!piece || !texture || !texture.isTexture) {
      throw new TypeError(
        "La pedina richiede un personaggio e la sua texture.",
      );
    }
    if (texture.colorSpace === THREE.NoColorSpace) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
    const group = new THREE.Group();
    group.name = "Pedina " + id;
    const body = cutout(THREE, piece, texture);
    const ink = new THREE.MeshStandardMaterial({
      color: piece.color,
      roughness: 0.9,
    });
    const paperEdge = body.material[2];
    const frontFoot = foot(THREE, 0.64, 0.168, false, ink, paperEdge);
    frontFoot.name = "Base di cartoncino";
    // The printed base continues into the silhouette, as on a punched paper playing piece.
    // Keep its front surface behind the character's ink where the two overlap.
    frontFoot.scale.z = 0.88;
    const crossFoot = foot(THREE, 0.53, 0.147, true, ink, paperEdge);
    crossFoot.rotation.y = Math.PI / 2;
    crossFoot.name = "Piedino a incastro";
    group.add(body, frontFoot, crossFoot);
    for (const mesh of group.children) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
    return group;
  }

  window.PimpaPawn = Object.freeze({ create });
})();
