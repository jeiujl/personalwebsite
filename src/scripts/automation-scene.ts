// The interactive 3D hero: five tiles telling the story of one automation
// (missed call → text back → CRM → booked → review), joined by paths that a
// glowing pulse travels along. Loaded lazily by HeroScene.astro.
import {
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  QuadraticBezierCurve3,
  Raycaster,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { iconPaths, type IconName } from '../lib/icons';

export interface SceneNode {
  icon: IconName;
  label: string;
}

interface Options {
  nodes: SceneNode[];
  /** Called when the pulse reaches a node (index), so the caption can follow. */
  onStep?: (index: number) => void;
  /** Called once the first frame has been drawn. */
  onReady?: () => void;
}

// Positions for a wide stage; x is squeezed and y stretched on narrow screens.
const BASE_LAYOUT: [number, number, number][] = [
  [-3.1, 0.7, 0.2],
  [-1.45, 2.0, -0.6],
  [0.1, 0.35, 0.6],
  [1.7, 1.85, -0.4],
  [3.1, 0.45, 0.3],
];

const TILE = 1.2;
const DWELL = 0.9; // seconds a node stays lit before the pulse moves on
const TRAVEL = 1.0; // seconds per path
const HOLD = 1.8; // pause on the last node
const RESET = 0.7; // fade back before looping

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function readColors() {
  const css = getComputedStyle(document.documentElement);
  const get = (name: string) => new Color(css.getPropertyValue(name).trim() || '#888');
  return {
    surface: get('--surface'),
    ink: get('--ink'),
    muted: get('--muted'),
    accent: get('--accent'),
    accentInk: get('--accent-ink'),
    dark: document.documentElement.dataset.theme === 'dark',
  };
}

function drawIcon(canvas: HTMLCanvasElement, icon: IconName, color: string) {
  const ctx = canvas.getContext('2d')!;
  const size = canvas.width;
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(new Path2D(iconPaths[icon]));
  ctx.restore();
}

function drawLabel(canvas: HTMLCanvasElement, text: string, color: string) {
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const family = getComputedStyle(document.body).fontFamily;
  ctx.font = `600 52px ${family}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function radialTexture(inner: string, outer: string) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function mount(container: HTMLElement, { nodes, onStep, onReady }: Options) {
  let colors = readColors();

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, matchMedia('(pointer: coarse)').matches ? 1.75 : 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  const world = new Group();
  scene.add(world);

  scene.add(new HemisphereLight(0xffffff, 0xd6d3d1, 1.6));
  const key = new DirectionalLight(0xffffff, 1.8);
  key.position.set(-3, 5, 8);
  scene.add(key);

  // Shared resources
  const tileGeometry = new RoundedBoxGeometry(TILE, TILE, 0.36, 5, 0.14);
  const iconGeometry = new PlaneGeometry(TILE * 0.52, TILE * 0.52);
  const labelGeometry = new PlaneGeometry(2.2, 0.5);
  const shadowGeometry = new PlaneGeometry(TILE * 1.7, TILE * 1.7);
  const shadowTexture = radialTexture('rgba(0,0,0,0.22)', 'rgba(0,0,0,0)');
  const glowTexture = radialTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)');

  const tiles = nodes.map((node, i) => {
    const group = new Group();
    const material = new MeshStandardMaterial({ color: colors.surface, roughness: 0.4, metalness: 0.05 });
    const tile = new Mesh(tileGeometry, material);
    tile.userData.index = i;

    const iconCanvas = document.createElement('canvas');
    iconCanvas.width = iconCanvas.height = 192;
    const iconTexture = new CanvasTexture(iconCanvas);
    iconTexture.colorSpace = SRGBColorSpace;
    const icon = new Mesh(iconGeometry, new MeshBasicMaterial({ map: iconTexture, transparent: true }));
    icon.position.z = 0.186;
    tile.add(icon); // so the icon follows the tile's wobble

    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 512;
    labelCanvas.height = 116;
    const labelTexture = new CanvasTexture(labelCanvas);
    labelTexture.colorSpace = SRGBColorSpace;
    const label = new Mesh(labelGeometry, new MeshBasicMaterial({ map: labelTexture, transparent: true }));
    label.position.y = -TILE * 0.85;

    const shadow = new Mesh(
      shadowGeometry,
      new MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }),
    );
    shadow.position.set(0.12, -0.18, -0.4);

    group.add(shadow, tile, label);
    world.add(group);
    return {
      node,
      group,
      tile,
      material,
      iconMaterial: icon.material,
      iconCanvas,
      iconTexture,
      labelCanvas,
      labelTexture,
      base: new Vector3(),
      active: 0, // 0 → 1, eased toward target
      target: 0,
      pop: 0,
      hover: 0,
    };
  });

  const paths = nodes.slice(1).map(() => {
    const base = new Mesh(undefined, new MeshBasicMaterial({ color: colors.muted, transparent: true, opacity: 0.35 }));
    const lit = new Mesh(undefined, new MeshBasicMaterial({ color: colors.accent }));
    world.add(base, lit);
    return { base, lit, curve: null as QuadraticBezierCurve3 | null, progress: 0 };
  });

  const pulse = new Mesh(new SphereGeometry(0.09, 20, 20), new MeshBasicMaterial({ color: colors.accent }));
  const glow = new Sprite(new SpriteMaterial({ map: glowTexture, color: colors.accent, transparent: true, depthWrite: false }));
  glow.scale.setScalar(0.85);
  pulse.add(glow);
  world.add(pulse);

  function paint() {
    const muted = `#${colors.muted.getHexString()}`;
    tiles.forEach((t) => {
      // Icons are drawn white and tinted through the material color each frame.
      drawIcon(t.iconCanvas, t.node.icon, '#ffffff');
      t.iconTexture.needsUpdate = true;
      drawLabel(t.labelCanvas, t.node.label, muted);
      t.labelTexture.needsUpdate = true;
    });
    paths.forEach((p) => {
      (p.base.material as MeshBasicMaterial).color.copy(colors.muted);
      (p.base.material as MeshBasicMaterial).opacity = colors.dark ? 0.45 : 0.35;
      (p.lit.material as MeshBasicMaterial).color.copy(colors.accent);
    });
    (pulse.material as MeshBasicMaterial).color.copy(colors.accent);
    glow.material.color.copy(colors.accent);
  }

  // Lay out nodes and rebuild the paths for the current aspect ratio.
  let aspect = 1;
  function layout() {
    const squeeze = Math.min(1, Math.max(0.58, aspect / 1.45));
    const stretch = 1 / Math.sqrt(squeeze);
    const points = BASE_LAYOUT.map(([x, y, z]) => new Vector3(x * squeeze, (y - 1.1) * stretch + 1.1, z));
    tiles.forEach((t, i) => t.base.copy(points[i]));

    paths.forEach((p, i) => {
      const a = points[i];
      const b = points[i + 1];
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.z += 0.9;
      mid.y += 0.35;
      p.curve = new QuadraticBezierCurve3(a, mid, b);
      p.base.geometry?.dispose();
      p.lit.geometry?.dispose();
      p.base.geometry = new TubeGeometry(p.curve, 60, 0.02, 6);
      p.lit.geometry = new TubeGeometry(p.curve, 60, 0.032, 6);
    });

    // Fit everything (plus labels) in view, leaving room for the caption below.
    const halfH = 2.1 * stretch + 0.8;
    const halfW = 3.1 * squeeze + 1.0;
    const t = Math.tan((camera.fov * Math.PI) / 360);
    const distance = Math.max(halfH / t, halfW / (t * aspect)) * 1.04;
    camera.position.set(0, 0.2, distance);
    camera.lookAt(0, 0.35, 0);
    world.position.y = -0.1;
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    aspect = w / h;
    renderer.setSize(w, h, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    layout();
  }

  // Pointer: tilt toward the cursor, highlight the hovered tile.
  const finePointer = matchMedia('(pointer: fine)').matches;
  const pointer = new Vector2(0, 0);
  const ndc = new Vector2(9, 9);
  const raycaster = new Raycaster();
  const onPointerMove = (e: PointerEvent) => {
    pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  };
  if (finePointer) window.addEventListener('pointermove', onPointerMove, { passive: true });

  // The story loop
  let phase: 'dwell' | 'travel' | 'hold' | 'reset' = 'dwell';
  let current = 0;
  let phaseTime = 0;
  function activate(i: number) {
    tiles[i].target = 1;
    tiles[i].pop = 1;
    onStep?.(i);
  }
  function step(dt: number) {
    phaseTime += dt;
    if (phase === 'dwell' && phaseTime >= DWELL) {
      phase = current === nodes.length - 1 ? 'hold' : 'travel';
      phaseTime = 0;
    } else if (phase === 'travel') {
      const p = Math.min(1, phaseTime / TRAVEL);
      paths[current].progress = easeInOut(p);
      if (p >= 1) {
        current += 1;
        activate(current);
        phase = 'dwell';
        phaseTime = 0;
      }
    } else if (phase === 'hold' && phaseTime >= HOLD) {
      phase = 'reset';
      phaseTime = 0;
      tiles.forEach((t) => (t.target = 0));
    } else if (phase === 'reset') {
      const fade = 1 - Math.min(1, phaseTime / RESET);
      paths.forEach((p) => (p.progress = Math.min(p.progress, fade)));
      if (phaseTime >= RESET) {
        paths.forEach((p) => (p.progress = 0));
        current = 0;
        activate(0);
        phase = 'dwell';
        phaseTime = 0;
      }
    }
  }

  const accentInkTint = new Color();
  const tileColor = new Color();
  let elapsed = 0;
  function update(dt: number) {
    elapsed += dt;
    step(dt);

    // World tilt
    const targetY = finePointer ? pointer.x * 0.28 : Math.sin(elapsed * 0.35) * 0.16;
    const targetX = finePointer ? pointer.y * 0.16 : Math.sin(elapsed * 0.27) * 0.06;
    world.rotation.y += (targetY - world.rotation.y) * Math.min(1, dt * 3);
    world.rotation.x += (targetX - world.rotation.x) * Math.min(1, dt * 3);

    // Hover
    let hovered = -1;
    if (finePointer) {
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(tiles.map((t) => t.tile), false)[0];
      if (hit) hovered = hit.object.userData.index as number;
    }

    tiles.forEach((t, i) => {
      t.active += (t.target - t.active) * Math.min(1, dt * 6);
      t.pop = Math.max(0, t.pop - dt * 2.2);
      t.hover += ((hovered === i ? 1 : 0) - t.hover) * Math.min(1, dt * 8);

      const scale = 1 + Math.sin(t.pop * Math.PI) * 0.16 + t.hover * 0.08;
      t.group.scale.setScalar(scale);
      t.group.position.copy(t.base);
      t.group.position.y += Math.sin(elapsed * 1.2 + i * 1.3) * 0.07;
      t.tile.rotation.y = Math.sin(elapsed * 0.6 + i) * 0.08;
      t.tile.rotation.x = Math.cos(elapsed * 0.5 + i) * 0.05;

      tileColor.copy(colors.surface).lerp(colors.accent, t.active);
      t.material.color.copy(tileColor);
      accentInkTint.copy(colors.ink).lerp(colors.accentInk, t.active);
      t.iconMaterial.color.copy(accentInkTint);
    });

    // Paths: draw the lit tube up to the pulse
    paths.forEach((p) => {
      const geometry = p.lit.geometry;
      const index = geometry.index;
      if (!index) return;
      const triangles = Math.floor((index.count / 3) * p.progress);
      geometry.setDrawRange(0, triangles * 3);
      p.lit.visible = triangles > 0;
    });

    // Pulse
    const travelling = phase === 'travel' && paths[current]?.curve;
    pulse.visible = Boolean(travelling);
    if (travelling) {
      paths[current].curve!.getPoint(paths[current].progress, pulse.position);
      glow.scale.setScalar(0.75 + Math.sin(elapsed * 10) * 0.08);
    }
  }

  // Render loop, paused when offscreen or the tab is hidden
  let frame = 0;
  let last = performance.now();
  let visible = true;
  let first = true;
  function loop(now: number) {
    frame = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    renderer.render(scene, camera);
    if (first) {
      first = false;
      onReady?.();
    }
  }
  function start() {
    if (frame || !visible || document.hidden) return;
    last = performance.now();
    frame = requestAnimationFrame(loop);
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? start() : stop();
  });
  io.observe(container);
  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  // Follow the light/dark toggle
  const themeObserver = new MutationObserver(() => {
    colors = readColors();
    paint();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  resize();
  paint();
  document.fonts?.ready.then(paint);
  activate(0);
  start();

  return function dispose() {
    stop();
    io.disconnect();
    ro.disconnect();
    themeObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pointermove', onPointerMove);
    scene.traverse((obj) => {
      if (obj instanceof Mesh || obj instanceof Sprite) {
        obj.geometry?.dispose();
        const material = obj.material as MeshBasicMaterial;
        material.map?.dispose();
        material.dispose();
      }
    });
    renderer.dispose();
    renderer.domElement.remove();
  };
}
