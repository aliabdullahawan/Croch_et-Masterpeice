/* ════════════════════════════════════════════════════════════════
   components/ui/interactive-globe.tsx
   3D canvas-based interactive globe with animated connection arcs.
   Drag to rotate. Auto-rotates when idle.
   Adapted for Croch_et Masterpiece admin — markers show crochet
   market cities (Pakistan + international customer bases).
════════════════════════════════════════════════════════════════ */
"use client";

import { cn } from "@/lib/utils";
import { useRef, useEffect, useCallback } from "react";

/* ── Prop Types ───────────────────────────────────────────────── */
interface GlobeProps {
  className?:        string;
  size?:             number;
  dotColor?:         string;
  arcColor?:         string;
  markerColor?:      string;
  autoRotateSpeed?:  number;
  connections?:      { from: [number, number]; to: [number, number] }[];
  markers?:          { lat: number; lng: number; label?: string }[];
}

/* ── Default markers — key crochet customer/market cities ─────── */
const DEFAULT_MARKERS = [
  { lat: 24.86,  lng: 67.01,  label: "Karachi"        },
  { lat: 31.56,  lng: 74.35,  label: "Lahore"          },
  { lat: 25.20,  lng: 55.27,  label: "Dubai"           },
  { lat: 51.51,  lng: -0.13,  label: "London"          },
  { lat: 40.71,  lng: -74.01, label: "New York"        },
  { lat: 35.68,  lng: 139.69, label: "Tokyo"           },
  { lat: 1.35,   lng: 103.82, label: "Singapore"       },
  { lat: 48.86,  lng: 2.35,   label: "Paris"           },
  { lat: -33.87, lng: 151.21, label: "Sydney"          },
  { lat: 28.61,  lng: 77.21,  label: "Delhi"           },
];

/* ── Connection arcs between cities ─────────────────────────── */
const DEFAULT_CONNECTIONS: { from: [number, number]; to: [number, number] }[] = [
  { from: [24.86, 67.01], to: [25.20, 55.27]   },  // Karachi → Dubai
  { from: [24.86, 67.01], to: [51.51, -0.13]   },  // Karachi → London
  { from: [25.20, 55.27], to: [51.51, -0.13]   },  // Dubai → London
  { from: [51.51, -0.13], to: [40.71, -74.01]  },  // London → New York
  { from: [51.51, -0.13], to: [48.86, 2.35]    },  // London → Paris
  { from: [24.86, 67.01], to: [28.61, 77.21]   },  // Karachi → Delhi
  { from: [25.20, 55.27], to: [1.35, 103.82]   },  // Dubai → Singapore
  { from: [1.35, 103.82], to: [35.68, 139.69]  },  // Singapore → Tokyo
  { from: [1.35, 103.82], to: [-33.87, 151.21] },  // Singapore → Sydney
];

/* ── Math helpers ─────────────────────────────────────────────── */

/** Convert lat/lng degrees to 3D Cartesian coordinates */
function latLngToXYZ(lat: number, lng: number, radius: number): [number, number, number] {
  const phi   = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

/** Rotate a point around the Y axis */
function rotateY(x: number, y: number, z: number, angle: number): [number, number, number] {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  return [x * cos + z * sin, y, -x * sin + z * cos];
}

/** Rotate a point around the X axis */
function rotateX(x: number, y: number, z: number, angle: number): [number, number, number] {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  return [x, y * cos - z * sin, y * sin + z * cos];
}

/** Simple perspective projection */
function project(x: number, y: number, z: number, cx: number, cy: number, fov: number): [number, number, number] {
  const scale = fov / (fov + z);
  return [x * scale + cx, y * scale + cy, z];
}

/* ── Globe Component ─────────────────────────────────────────── */
export function Component({
  className,
  size             = 600,
  dotColor         = "rgba(201, 160, 40, ALPHA)",   // brand gold
  arcColor         = "rgba(107, 191, 191, 0.5)",    // brand teal
  markerColor      = "rgba(232, 160, 168, 1)",      // brand rose
  autoRotateSpeed  = 0.002,
  connections      = DEFAULT_CONNECTIONS,
  markers          = DEFAULT_MARKERS,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotYRef   = useRef(0.4);
  const rotXRef   = useRef(0.3);
  const dragRef   = useRef<{
    active: boolean; startX: number; startY: number; startRotY: number; startRotX: number;
  }>({ active: false, startX: 0, startY: 0, startRotY: 0, startRotX: 0 });
  const animRef   = useRef<number>(0);
  const timeRef   = useRef(0);

  /* Pre-compute Fibonacci sphere dots (globe surface texture) */
  const dotsRef = useRef<[number, number, number][]>([]);
  useEffect(() => {
    const dots: [number, number, number][] = [];
    const numDots = 1200;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < numDots; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi   = Math.acos(1 - (2 * (i + 0.5)) / numDots);
      dots.push([
        Math.cos(theta) * Math.sin(phi),
        Math.cos(phi),
        Math.sin(theta) * Math.sin(phi),
      ]);
    }
    dotsRef.current = dots;
  }, []);

  /* Main draw loop — called every animation frame */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high-DPI screens
    const dpr = window.devicePixelRatio || 1;
    const w   = canvas.clientWidth;
    const h   = canvas.clientHeight;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const cx     = w / 2;
    const cy     = h / 2;
    const radius = Math.min(w, h) * 0.38;
    const fov    = 600;

    // Auto-rotate when not dragging
    if (!dragRef.current.active) {
      rotYRef.current += autoRotateSpeed;
    }
    timeRef.current += 0.015;
    const time = timeRef.current;

    ctx.clearRect(0, 0, w, h);

    // Outer ambient glow (warm gold tint for brand feel)
    const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.5);
    glowGrad.addColorStop(0, "rgba(201, 160, 40, 0.04)");
    glowGrad.addColorStop(1, "rgba(201, 160, 40, 0)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, w, h);

    // Globe rim circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(201, 160, 40, 0.08)";
    ctx.lineWidth   = 1;
    ctx.stroke();

    const ry = rotYRef.current;
    const rx = rotXRef.current;

    /* ── Draw surface dots ───────────────────────────────────── */
    for (const dot of dotsRef.current) {
      let [x, y, z] = dot;
      x *= radius; y *= radius; z *= radius;
      [x, y, z] = rotateX(x, y, z, rx);
      [x, y, z] = rotateY(x, y, z, ry);
      if (z > 0) continue; // back-face cull (don't draw far side)
      const [sx, sy] = project(x, y, z, cx, cy, fov);
      const depthAlpha = Math.max(0.1, 1 - (z + radius) / (2 * radius));
      const dotSize    = 1 + depthAlpha * 0.8;
      ctx.beginPath();
      ctx.arc(sx, sy, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = dotColor.replace("ALPHA", depthAlpha.toFixed(2));
      ctx.fill();
    }

    /* ── Draw connection arcs ────────────────────────────────── */
    for (const conn of connections) {
      let [x1, y1, z1] = latLngToXYZ(conn.from[0], conn.from[1], radius);
      let [x2, y2, z2] = latLngToXYZ(conn.to[0],   conn.to[1],   radius);
      [x1, y1, z1] = rotateX(x1, y1, z1, rx);
      [x1, y1, z1] = rotateY(x1, y1, z1, ry);
      [x2, y2, z2] = rotateX(x2, y2, z2, rx);
      [x2, y2, z2] = rotateY(x2, y2, z2, ry);

      // Skip arcs where both endpoints are on the far side
      if (z1 > radius * 0.3 && z2 > radius * 0.3) continue;

      const [sx1, sy1] = project(x1, y1, z1, cx, cy, fov);
      const [sx2, sy2] = project(x2, y2, z2, cx, cy, fov);

      // Elevated midpoint creates the arc above the sphere
      const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2, midZ = (z1 + z2) / 2;
      const midLen = Math.sqrt(midX * midX + midY * midY + midZ * midZ);
      const elevX  = (midX / midLen) * radius * 1.25;
      const elevY  = (midY / midLen) * radius * 1.25;
      const elevZ  = (midZ / midLen) * radius * 1.25;
      const [scx, scy] = project(elevX, elevY, elevZ, cx, cy, fov);

      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.quadraticCurveTo(scx, scy, sx2, sy2);
      ctx.strokeStyle = arcColor;
      ctx.lineWidth   = 1.2;
      ctx.stroke();

      // Traveling dot along the arc (animated)
      const t  = (Math.sin(time * 1.2 + conn.from[0] * 0.1) + 1) / 2;
      const tx = (1 - t) * (1 - t) * sx1 + 2 * (1 - t) * t * scx + t * t * sx2;
      const ty = (1 - t) * (1 - t) * sy1 + 2 * (1 - t) * t * scy + t * t * sy2;
      ctx.beginPath();
      ctx.arc(tx, ty, 2, 0, Math.PI * 2);
      ctx.fillStyle = markerColor;
      ctx.fill();
    }

    /* ── Draw city markers ───────────────────────────────────── */
    for (const marker of markers) {
      let [x, y, z] = latLngToXYZ(marker.lat, marker.lng, radius);
      [x, y, z] = rotateX(x, y, z, rx);
      [x, y, z] = rotateY(x, y, z, ry);
      if (z > radius * 0.1) continue; // skip markers on far side

      const [sx, sy] = project(x, y, z, cx, cy, fov);

      // Pulsing ring
      const pulse = Math.sin(time * 2 + marker.lat) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(sx, sy, 4 + pulse * 4, 0, Math.PI * 2);
      ctx.strokeStyle = markerColor.replace("1)", `${0.2 + pulse * 0.15})`);
      ctx.lineWidth   = 1;
      ctx.stroke();

      // Core dot
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = markerColor;
      ctx.fill();

      // City label
      if (marker.label) {
        ctx.font      = "10px DM Sans, system-ui, sans-serif";
        ctx.fillStyle = markerColor.replace("1)", "0.7)");
        ctx.fillText(marker.label, sx + 8, sy + 3);
      }
    }

    animRef.current = requestAnimationFrame(draw);
  }, [dotColor, arcColor, markerColor, autoRotateSpeed, connections, markers]);

  /* Start / stop animation frame loop */
  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  /* Mouse / touch drag handlers */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = {
      active:   true,
      startX:   e.clientX,
      startY:   e.clientY,
      startRotY: rotYRef.current,
      startRotX: rotXRef.current,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    rotYRef.current = dragRef.current.startRotY + dx * 0.005;
    rotXRef.current = Math.max(-1, Math.min(1, dragRef.current.startRotX + dy * 0.005));
  }, []);

  const onPointerUp = useCallback(() => { dragRef.current.active = false; }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("cursor-grab active:cursor-grabbing", className)}
      style={{ width: size, height: size }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
}

export default Component;
