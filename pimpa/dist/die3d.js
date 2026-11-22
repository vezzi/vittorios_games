/* A filleted resin die with cut openings and shallow, inset ivory pips. */
(() => {
  "use strict";

  function create(THREE) {
    const half = 0.38;
    const radius = 0.096;
    const flat = half - radius;
    const pipRadius = 0.057;
    const pipDepth = 0.019;
    const spacing = 0.157;
    const sides = 30;
    const up = new THREE.Vector3(0, 1, 0);
    const zAxis = new THREE.Vector3(0, 0, 1);
    const object = new THREE.Group();
    object.name = "Dado rosso";
    object.position.y = half;

    const faceNormals = [
      null,
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, -1, 0),
      up.clone(),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(-1, 0, 0),
    ];
    const patterns = [
      [],
      [[0, 0]],
      [
        [-1, 1],
        [1, -1],
      ],
      [
        [-1, 1],
        [0, 0],
        [1, -1],
      ],
      [
        [-1, 1],
        [1, 1],
        [-1, -1],
        [1, -1],
      ],
      [
        [-1, 1],
        [1, 1],
        [0, 0],
        [-1, -1],
        [1, -1],
      ],
      [
        [-1, 1],
        [1, 1],
        [-1, 0],
        [1, 0],
        [-1, -1],
        [1, -1],
      ],
    ];

    const emptySurface = () => ({ positions: [], normals: [], indices: [] });
    const shell = emptySurface();
    const ivory = emptySurface();
    const faceRotation = new THREE.Quaternion();
    const point = new THREE.Vector3();
    const normal = new THREE.Vector3();

    function vertex(surface, x, y, z, nx, ny, nz) {
      point.set(x, y, z).applyQuaternion(faceRotation);
      normal.set(nx, ny, nz).normalize().applyQuaternion(faceRotation);
      const index = surface.positions.length / 3;
      surface.positions.push(point.x, point.y, point.z);
      surface.normals.push(normal.x, normal.y, normal.z);
      return index;
    }

    // The rolled edge is part of the mesh. The flat square in each face is
    // triangulated separately so the holes in the lacquer have real depth.
    const grid = [];
    const edgeSteps = 9;
    for (let i = 0; i <= edgeSteps; i++)
      grid.push(-half + (radius * i) / edgeSteps);
    for (let i = 0; i <= edgeSteps; i++)
      grid.push(flat + (radius * i) / edgeSteps);

    function roundedEdge() {
      const start = shell.positions.length / 3;
      for (const y of grid) {
        for (const x of grid) {
          const cx = THREE.MathUtils.clamp(x, -flat, flat);
          const cy = THREE.MathUtils.clamp(y, -flat, flat);
          const length = Math.hypot(x - cx, y - cy, radius);
          const nx = (x - cx) / length,
            ny = (y - cy) / length,
            nz = radius / length;
          vertex(
            shell,
            cx + radius * nx,
            cy + radius * ny,
            flat + radius * nz,
            nx,
            ny,
            nz,
          );
        }
      }
      for (let row = 0; row < grid.length - 1; row++) {
        for (let col = 0; col < grid.length - 1; col++) {
          if (row === edgeSteps && col === edgeSteps) continue;
          const a = start + row * grid.length + col;
          const b = a + grid.length;
          shell.indices.push(a, a + 1, b + 1, a, b + 1, b);
        }
      }
    }

    function addPip(cx, cy) {
      // A narrow red bevel joins the lacquer to the concave inlay.
      const rings = [0, 0.36, 0.64, 0.83, 0.905, 1];
      const hole = [];
      for (let j = 0; j < sides; j++) {
        const angle = (j * 2 * Math.PI) / sides;
        hole.push(
          new THREE.Vector2(
            cx + pipRadius * Math.cos(angle),
            cy + pipRadius * Math.sin(angle),
          ),
        );
      }
      function ringVertex(surface, frac, j) {
        const angle = (j * 2 * Math.PI) / sides;
        const cos = Math.cos(angle),
          sin = Math.sin(angle);
        const gradient = (2 * pipDepth * frac) / pipRadius;
        return vertex(
          surface,
          cx + pipRadius * frac * cos,
          cy + pipRadius * frac * sin,
          half - pipDepth * (1 - frac * frac),
          -gradient * cos,
          -gradient * sin,
          1,
        );
      }
      for (let k = 0; k < rings.length - 1; k++) {
        const surface = k === rings.length - 2 ? shell : ivory;
        const start = surface.positions.length / 3;
        for (let j = 0; j < sides; j++) {
          ringVertex(surface, rings[k], j);
          ringVertex(surface, rings[k + 1], j);
        }
        for (let j = 0; j < sides; j++) {
          const a = start + 2 * j;
          const b = start + 2 * ((j + 1) % sides);
          surface.indices.push(a, a + 1, b + 1);
          if (k > 0) surface.indices.push(a, b + 1, b);
        }
      }
      return hole;
    }

    for (let value = 1; value <= 6; value++) {
      faceRotation.setFromUnitVectors(zAxis, faceNormals[value]);
      roundedEdge();
      const contour = [
        [-flat, -flat],
        [flat, -flat],
        [flat, flat],
        [-flat, flat],
      ].map(([x, y]) => new THREE.Vector2(x, y));
      const holes = patterns[value].map(([x, y]) =>
        addPip(x * spacing, y * spacing),
      );
      const triangles = THREE.ShapeUtils.triangulateShape(contour, holes);
      const all = contour.concat(...holes);
      const start = shell.positions.length / 3;
      for (const v of all) vertex(shell, v.x, v.y, half, 0, 0, 1);
      for (const [a, b, c] of triangles)
        shell.indices.push(start + a, start + b, start + c);
    }

    function mesh(surface, material, name) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(surface.positions, 3),
      );
      geometry.setAttribute(
        "normal",
        new THREE.Float32BufferAttribute(surface.normals, 3),
      );
      geometry.setIndex(surface.indices);
      geometry.computeBoundingSphere();
      const result = new THREE.Mesh(geometry, material);
      result.name = name;
      result.castShadow = true;
      result.receiveShadow = true;
      object.add(result);
    }
    mesh(
      shell,
      new THREE.MeshPhysicalMaterial({
        color: 0xe72330,
        roughness: 0.29,
        metalness: 0,
        clearcoat: 0.32,
        clearcoatRoughness: 0.26,
        ior: 1.46,
      }),
      "Lacca rossa",
    );
    mesh(
      ivory,
      new THREE.MeshStandardMaterial({
        color: 0xfff4de,
        roughness: 0.46,
        metalness: 0,
      }),
      "Puntini incavati",
    );

    const base = new THREE.Quaternion();
    const yawRotation = new THREE.Quaternion();
    const spin = new THREE.Quaternion();
    const rotationMatrix = new THREE.Matrix4();
    let flight = null;

    function faceUp(value, yaw) {
      const alignment = new THREE.Quaternion().setFromUnitVectors(
        faceNormals[value] || up,
        up,
      );
      return yawRotation.setFromAxisAngle(up, yaw).clone().multiply(alignment);
    }
    function orient(value) {
      object.quaternion.copy(faceUp(value, -0.29));
    }
    orient(4);

    const bounceTimes = [0, 0.52, 0.81, 1];
    const bounceHeights = [0.92, 0.27, 0.068];
    function height(t) {
      const i = t < bounceTimes[1] ? 0 : t < bounceTimes[2] ? 1 : 2;
      const u = (t - bounceTimes[i]) / (bounceTimes[i + 1] - bounceTimes[i]);
      return 4 * bounceHeights[i] * u * (1 - u);
    }

    function update(now) {
      if (!flight) return;
      const f = flight;
      const t = THREE.MathUtils.clamp((now - f.began) / 1320, 0, 1);
      if (t === 1) {
        object.position.copy(f.end);
        object.position.y += half;
        object.quaternion.copy(f.finalRotation);
        flight = null;
        f.resolve();
        return;
      }
      const travel = 1 - Math.pow(1 - t, 1.65);
      base.slerpQuaternions(f.initialRotation, f.finalRotation, travel);
      spin.setFromAxisAngle(f.axis, f.fullTurns * Math.PI * 2 * travel);
      object.quaternion.copy(spin).multiply(base);
      object.position.lerpVectors(f.start, f.end, travel);
      object.position.addScaledVector(f.bend, Math.sin(travel * Math.PI));
      // Support function of a rounded box. A corner in contact with the wood
      // raises the centre higher than a face lying flat.
      const m = rotationMatrix.makeRotationFromQuaternion(
        object.quaternion,
      ).elements;
      const support =
        flat * (Math.abs(m[1]) + Math.abs(m[5]) + Math.abs(m[9])) + radius;
      object.position.y += support + height(t);
    }

    function throwTo(value, start, end, reduced = false) {
      if (flight) {
        flight.resolve();
        flight = null;
      }
      const finalRotation = faceUp(value, -0.44 + Math.random() * 0.8);
      if (reduced) {
        object.position.copy(end);
        object.position.y += half;
        object.quaternion.copy(finalRotation);
        return Promise.resolve();
      }
      const travelX = end.x - start.x,
        travelZ = end.z - start.z;
      const bend = new THREE.Vector3(-travelZ, 0, travelX)
        .normalize()
        .multiplyScalar(0.12);
      return new Promise((resolve) => {
        flight = {
          start: start.clone(),
          end: end.clone(),
          initialRotation: object.quaternion.clone(),
          finalRotation,
          began: performance.now(),
          bend,
          resolve,
          axis: new THREE.Vector3(
            0.8,
            0.35,
            -0.62 + Math.random() * 0.36,
          ).normalize(),
          fullTurns: 2 + Math.floor(Math.random() * 2),
        };
        update(flight.began);
      });
    }

    return { object, orient, throwTo, update };
  }

  window.PimpaDie = Object.freeze({ create });
})();
