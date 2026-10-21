// The interactive 3D hero: a night sky with five round nodes that tell the
// story of one automation (missed call → text back → CRM → booked → review),
// threaded on one smooth wave that a mint pulse travels along. It auto-plays until the visitor scrolls;
// then the scroll story drives it through setProgress/setFocus.
// Loaded lazily by HeroScene.astro.
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Curve,
  CylinderGeometry,
  DirectionalLight,
  EdgesGeometry,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { iconPaths, type IconName } from '../lib/icons';

export interface SceneNode {
  icon: IconName;
  label: string;
}

interface Options {
  nodes: SceneNode[];
  /** Called when a new step becomes the current one. */
  onStep?: (index: number) => void;
  /** Called once the first frame has been drawn. */
  onReady?: () => void;
}

export interface AutomationScene {
  /** Story progress 0 → 1 across all steps; stops the auto-play. */
  setProgress(progress: number): void;
  /** 0 = beside the headline, 1 = centered for the story. */
  setFocus(focus: number): void;
  /** Resume the auto-playing loop (e.g. back at the top of the page). */
  play(): void;
  dispose(): void;
}

// ── Network geometry ──────────────────────────────────────────────────────
// Round "coin" nodes. Lines end on a circle (RIM) larger than the node's
// biggest on-screen outline, so they never run into it: the mint ring at full
// pop + hover, plus the coin's side wall when it's turned by the pointer tilt
// and wobble, plus a small gap.
const NODE_R = 0.48;
const NODE_DEPTH = 0.28;
const RING_TUBE = 0.014;
const POP = 0.08;
const HOVER = 0.04;
const MAX_YAW = 0.2; // pointer tilt
const WOBBLE = 0.1; // per-coin sway
const RIM = (NODE_R + RING_TUBE) * (1 + POP + HOVER) + (NODE_DEPTH / 2) * Math.sin(MAX_YAW + WOBBLE) + 0.03;
const TUBE_SEG = 64;
const TUBE_RAD = 8;

// One smooth sine period through the five nodes: mid → high → mid → low → mid.
// Depth (z) is flat at every node, so lines stay level with the node faces.
const SPAN = 3.36;
const STEP = (2 * SPAN) / 4;
const wavePhase = (x: number) => (x + SPAN) / STEP;
const waveY = (x: number) => 0.2 + 0.9 * Math.sin((Math.PI / 2) * wavePhase(x));
const waveZ = (x: number) => 0.14 * Math.cos(Math.PI * wavePhase(x));
const wavePoint = (x: number, target = new Vector3()) => target.set(x, waveY(x), waveZ(x));
const nodeX = (i: number) => -SPAN + i * STEP;

/** A slice [x0, x1] of the wave. Use getPointAt for even (arc-length) spacing. */
class WaveSegment extends Curve<Vector3> {
  x0: number;
  x1: number;
  constructor(x0: number, x1: number) {
    super();
    this.x0 = x0;
    this.x1 = x1;
    this.arcLengthDivisions = 400;
  }
  override getPoint(t: number, target = new Vector3()) {
    return wavePoint(this.x0 + (this.x1 - this.x0) * t, target);
  }
}

/** Where the wave, leaving the node at xc in direction dir, crosses radius r. */
function rimX(xc: number, dir: 1 | -1, r: number) {
  const yc = waveY(xc);
  const dist = (x: number) => Math.hypot(x - xc, waveY(x) - yc);
  const h = (dir * STEP) / 256;
  let lo = xc;
  let hi = xc + h;
  for (let k = 0; k < 256 && dist(hi) < r; k++) {
    lo = hi;
    hi += h;
  }
  for (let k = 0; k < 30; k++) {
    const mid = (lo + hi) / 2;
    if (dist(mid) < r) lo = mid;
    else hi = mid;
  }
  return hi;
}
const DWELL = 1.0; // auto-play: seconds a node stays lit before moving on
const TRAVEL = 1.0; // auto-play: seconds per path
const HOLD = 1.8; // auto-play: pause on the last node

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function readColors(el: HTMLElement) {
  const css = getComputedStyle(el);
  const get = (name: string, fallback: string) => new Color(css.getPropertyValue(name).trim() || fallback);
  return {
    ink: get('--ink', '#fffce1'),
    muted: get('--muted', '#8f8f82'),
    accent: get('--accent', '#73ffb9'),
    tile: new Color('#121311'),
    tileLit: new Color('#18231c'),
    monoFont: css.getPropertyValue('--font-geist-mono').trim() || 'monospace',
  };
}

function glowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function drawIcon(canvas: HTMLCanvasElement, icon: IconName) {
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(canvas.width / 24, canvas.height / 24);
  ctx.strokeStyle = '#ffffff'; // tinted through the material color
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(new Path2D(iconPaths[icon]));
  ctx.restore();
}

function drawLabel(canvas: HTMLCanvasElement, text: string, font: string) {
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `500 40px ${font}`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Letter-spacing for the mono label look
  ctx.letterSpacing = '2px';
  ctx.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2);
}

export function mount(container: HTMLElement, { nodes, onStep, onReady }: Options): AutomationScene {
  const colors = readColors(container);
  const coarse = matchMedia('(pointer: coarse)').matches;

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.75 : 2));
  renderer.outputColorSpace = SRGBColorSpace;
  Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%' });
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(34, 1, 0.1, 100);
  scene.add(new HemisphereLight(0xfffce1, 0x0b0c0b, 1.1));
  const key = new DirectionalLight(0xffffff, 2.2);
  key.position.set(-4, 6, 8);
  scene.add(key);
  const rim = new DirectionalLight(0x73ffb9, 0.9);
  rim.position.set(5, -3, -4);
  scene.add(rim);

  const glow = glowTexture();

  // ── Starfield ───────────────────────────────────────────────────────────
  const starLayers = [0, 1].map((layer) => {
    const count = coarse ? 260 : 420;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 34;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 2] = -4 - Math.random() * 14;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    const material = new PointsMaterial({
      color: colors.ink,
      map: glow,
      size: layer ? 0.11 : 0.07,
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      opacity: 0.7,
    });
    const points = new Points(geometry, material);
    scene.add(points);
    return points;
  });

  // ── Network ─────────────────────────────────────────────────────────────
  const world = new Group();
  scene.add(world);

  // Rotate the geometry (not the mesh) so the coin faces the camera; the mesh
  // rotation is used for the gentle wobble.
  const tileGeometry = new CylinderGeometry(NODE_R, NODE_R, NODE_DEPTH, 72, 1).rotateX(Math.PI / 2);
  const edgeGeometry = new EdgesGeometry(tileGeometry, 25); // front and back rim circles
  const iconGeometry = new PlaneGeometry(NODE_R * 0.96, NODE_R * 0.96);
  const ringGeometry = new TorusGeometry(NODE_R, RING_TUBE, 8, 96);
  const labelGeometry = new PlaneGeometry(2.6, 0.32);

  const tiles = nodes.map((node, i) => {
    const group = new Group();
    const material = new MeshStandardMaterial({ color: colors.tile, roughness: 0.32, metalness: 0.35 });
    const tile = new Mesh(tileGeometry, material);
    tile.userData.index = i;

    const edgeMaterial = new LineBasicMaterial({ color: colors.muted, transparent: true, opacity: 0.55 });
    tile.add(new LineSegments(edgeGeometry, edgeMaterial));
    // A thicker mint rim that fades in when the node lights up. Like the label,
    // it doesn't write depth, so it can't cut into glows drawn after it.
    const ringMaterial = new MeshBasicMaterial({ color: colors.accent, transparent: true, opacity: 0, depthWrite: false });
    const ring = new Mesh(ringGeometry, ringMaterial);
    ring.position.z = NODE_DEPTH / 2;
    tile.add(ring);

    const iconCanvas = document.createElement('canvas');
    iconCanvas.width = iconCanvas.height = 192;
    drawIcon(iconCanvas, node.icon);
    const iconTexture = new CanvasTexture(iconCanvas);
    iconTexture.colorSpace = SRGBColorSpace;
    const iconMaterial = new MeshBasicMaterial({ map: iconTexture, transparent: true, color: colors.ink });
    const icon = new Mesh(iconGeometry, iconMaterial);
    icon.position.z = NODE_DEPTH / 2 + 0.004;
    tile.add(icon);

    const halo = new Sprite(
      new SpriteMaterial({ map: glow, color: colors.accent, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
    );
    halo.scale.setScalar(NODE_R * 6.4);
    halo.position.z = -0.3;

    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 640;
    labelCanvas.height = 80;
    const labelTexture = new CanvasTexture(labelCanvas);
    labelTexture.colorSpace = SRGBColorSpace;
    const labelMaterial = new MeshBasicMaterial({ map: labelTexture, transparent: true, depthWrite: false, color: colors.muted });
    const label = new Mesh(labelGeometry, labelMaterial);
    label.position.y = -(NODE_R + 0.4);

    group.add(halo, tile, label);
    world.add(group);
    return {
      node,
      group,
      tile,
      material,
      edgeMaterial,
      ring,
      ringMaterial,
      iconMaterial,
      halo,
      label,
      labelCanvas,
      labelTexture,
      labelMaterial,
      base: wavePoint(nodeX(i)),
      active: 0,
      pop: 0,
      hover: 0,
      wasActive: false,
    };
  });

  const paintLabels = () =>
    tiles.forEach((t, i) => {
      drawLabel(t.labelCanvas, `${String(i + 1).padStart(2, '0')} ${t.node.label}`, colors.monoFont);
      t.labelTexture.needsUpdate = true;
    });
  paintLabels();
  document.fonts?.ready.then(paintLabels);

  // One continuous wave, split into segments that start and end at the rims
  const paths = tiles.slice(1).map((_, i) => {
    const curve = new WaveSegment(rimX(nodeX(i), 1, RIM), rimX(nodeX(i + 1), -1, RIM));
    const base = new Mesh(
      new TubeGeometry(curve, TUBE_SEG, 0.014, TUBE_RAD),
      new MeshBasicMaterial({ color: colors.ink, transparent: true, opacity: 0.18 }),
    );
    const lit = new Mesh(
      new TubeGeometry(curve, TUBE_SEG, 0.026, TUBE_RAD),
      new MeshBasicMaterial({ color: colors.accent }),
    );
    lit.geometry.setDrawRange(0, 0);
    world.add(base, lit);
    return { curve, base, lit };
  });

  const pulse = new Mesh(new SphereGeometry(0.075, 20, 20), new MeshBasicMaterial({ color: colors.accent }));
  const pulseGlow = new Sprite(
    new SpriteMaterial({ map: glow, color: colors.accent, transparent: true, depthWrite: false, blending: AdditiveBlending }),
  );
  pulseGlow.scale.setScalar(1.1);
  pulse.add(pulseGlow);
  world.add(pulse);

  // ── Framing ─────────────────────────────────────────────────────────────
  // Story framing is centered; hero framing tucks the network up and to the
  // side so the headline has room.
  let aspect = 1;
  let distance = 12;
  const heroFrame = { x: 0, y: 0, scale: 1 };
  let storyY = 0.5;
  let storyScale = 0.92;
  function resize() {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    aspect = w / h;
    renderer.setSize(w, h, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    const t = Math.tan((camera.fov * Math.PI) / 360);
    const halfW = 4.4;
    const halfH = 3.1;
    distance = Math.max(halfH / t, halfW / (t * aspect)) * 1.08;
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);
    // Visible half-extent at z = 0, used to place the hero framing
    const visibleH = distance * t;
    const visibleW = visibleH * aspect;
    storyY = visibleH * (aspect >= 1.1 ? 0.14 : 0.2);
    storyScale = aspect >= 1.1 ? 0.92 : 1.12;
    if (aspect >= 1.1) {
      heroFrame.scale = 0.55;
      heroFrame.x = visibleW * 0.4;
      heroFrame.y = visibleH * 0.36;
    } else {
      heroFrame.scale = 0.74;
      heroFrame.x = 0;
      heroFrame.y = visibleH * 0.34;
    }
  }

  // ── State ───────────────────────────────────────────────────────────────
  const n = nodes.length;
  let autoplay = true;
  let autoTime = 0;
  let target = 0;
  let progress = 0;
  let focusTarget = 0;
  let focus = 0;
  let currentStep = -1;

  function autoProgress(dt: number) {
    autoTime += dt;
    const cycle = (n - 1) * (DWELL + TRAVEL) + HOLD;
    if (autoTime >= cycle) autoTime -= cycle;
    const step = Math.floor(autoTime / (DWELL + TRAVEL));
    if (step >= n - 1) return 1;
    const local = autoTime - step * (DWELL + TRAVEL);
    return local < DWELL ? step / (n - 1) : (step + ease((local - DWELL) / TRAVEL)) / (n - 1);
  }

  // Pointer: tilt toward the cursor, highlight the hovered tile
  const pointer = new Vector2();
  const ndc = new Vector2(9, 9);
  const raycaster = new Raycaster();
  const onPointerMove = (e: PointerEvent) => {
    pointer.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  };
  if (!coarse) addEventListener('pointermove', onPointerMove, { passive: true });

  let elapsed = 0;
  const tint = new Color();
  function update(dt: number) {
    elapsed += dt;

    if (autoplay) {
      progress = autoProgress(dt);
    } else {
      progress += (target - progress) * Math.min(1, dt * 10);
    }
    focus += (focusTarget - focus) * Math.min(1, dt * 6);

    const s = progress * (n - 1);
    const step = Math.min(n - 1, Math.floor(s + 1e-4));
    if (step !== currentStep) {
      currentStep = step;
      onStep?.(step);
    }

    // Framing between hero and story
    // Story framing sits a little high, leaving the bottom for the caption
    const f = ease(clamp01(focus));
    world.position.set(mix(heroFrame.x, 0, f), mix(heroFrame.y, storyY, f) + Math.sin(elapsed * 0.8) * 0.04, 0);
    world.scale.setScalar(mix(heroFrame.scale, storyScale, f));

    // Tilt and sway
    const ty = coarse ? Math.sin(elapsed * 0.35) * 0.18 : pointer.x * MAX_YAW;
    const tx = coarse ? Math.sin(elapsed * 0.27) * 0.08 : pointer.y * 0.16;
    world.rotation.y += (ty - world.rotation.y) * Math.min(1, dt * 3);
    world.rotation.x += (tx - world.rotation.x) * Math.min(1, dt * 3);
    starLayers.forEach((stars, i) => {
      stars.rotation.y = elapsed * (i ? 0.004 : 0.007) - world.rotation.y * 0.15;
      stars.rotation.x = -world.rotation.x * 0.15;
      (stars.material as PointsMaterial).opacity = 0.5 + Math.sin(elapsed * (i ? 1.3 : 0.8) + i) * 0.2;
    });

    let hovered = -1;
    if (!coarse) {
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(tiles.map((t) => t.tile), false)[0];
      if (hit) hovered = hit.object.userData.index as number;
    }

    tiles.forEach((t, i) => {
      const isActive = s >= i - 1e-4;
      if (isActive && !t.wasActive) t.pop = 1;
      t.wasActive = isActive;
      t.active += ((isActive ? 1 : 0) - t.active) * Math.min(1, dt * 6);
      t.pop = Math.max(0, t.pop - dt * 2.2);
      t.hover += ((hovered === i ? 1 : 0) - t.hover) * Math.min(1, dt * 8);

      // Nodes stay put on the wave (so the rims line up with the line ends) and
      // "breathe" in depth instead of bobbing up and down.
      t.group.position.copy(t.base);
      t.tile.position.z = Math.sin(elapsed * 1.1 + i * 1.3) * 0.03;
      t.group.scale.setScalar(1 + Math.sin(t.pop * Math.PI) * POP + t.hover * HOVER);
      t.tile.rotation.y = Math.sin(elapsed * 0.55 + i) * WOBBLE;
      t.tile.rotation.x = Math.cos(elapsed * 0.45 + i) * 0.06;

      t.material.color.copy(colors.tile).lerp(colors.tileLit, t.active);
      t.edgeMaterial.color.copy(tint.copy(colors.muted).lerp(colors.accent, t.active));
      t.edgeMaterial.opacity = 0.45 + t.active * 0.5;
      t.iconMaterial.color.copy(tint.copy(colors.ink).lerp(colors.accent, t.active));
      t.labelMaterial.color.copy(tint.copy(colors.muted).lerp(colors.ink, Math.max(t.active * 0.6, t.hover)));
      // Labels only appear once the network takes center stage
      t.labelMaterial.opacity = Math.max(f, t.hover);
      t.label.visible = t.labelMaterial.opacity > 0.01;
      t.halo.material.opacity = t.active * 0.22 + Math.sin(t.pop * Math.PI) * 0.35;
      t.ringMaterial.opacity = t.active * 0.9;
      t.ring.visible = t.active > 0.01;
    });

    paths.forEach((p, i) => {
      const count = Math.floor(clamp01(s - i) * TUBE_SEG * TUBE_RAD) * 6;
      p.lit.geometry.setDrawRange(0, count);
      p.lit.visible = count > 0;
    });

    const segment = Math.min(n - 2, Math.floor(s));
    const along = s - segment;
    const moving = along > 0.001 && along < 0.999 && s < n - 1;
    pulse.visible = moving;
    if (moving) {
      // Arc-length position matches how the tube was built; the pulse grows out
      // of one rim and sinks into the next.
      paths[segment].curve.getPointAt(along, pulse.position);
      pulse.scale.setScalar(Math.min(1, along / 0.06, (1 - along) / 0.06));
      pulseGlow.scale.setScalar(1 + Math.sin(elapsed * 12) * 0.12);
    }
  }

  // ── Loop ────────────────────────────────────────────────────────────────
  let frame = 0;
  let last = performance.now();
  let visible = true;
  let first = true;
  function loop(now: number) {
    frame = requestAnimationFrame(loop);
    // rAF timestamps can be slightly earlier than the performance.now() taken
    // when the loop started, so never let a frame step backwards.
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    update(dt);
    renderer.render(scene, camera);
    if (first) {
      first = false;
      onReady?.();
    }
  }
  const start = () => {
    if (frame || !visible || document.hidden) return;
    last = performance.now();
    frame = requestAnimationFrame(loop);
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? start() : stop();
  });
  io.observe(container);
  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  resize();
  start();

  return {
    setProgress(p) {
      autoplay = false;
      target = clamp01(p);
    },
    setFocus(f) {
      focusTarget = clamp01(f);
    },
    play() {
      if (autoplay) return;
      autoplay = true;
      autoTime = 0;
      progress = 0;
    },
    dispose() {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      removeEventListener('pointermove', onPointerMove);
      scene.traverse((obj) => {
        const mesh = obj as Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material as MeshBasicMaterial | undefined;
        material?.map?.dispose();
        material?.dispose?.();
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
