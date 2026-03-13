"use client";
import React, { useRef, useEffect } from "react";

/* ══════════════════════════════════════════════════════
   components/ui/animated-shader-hero.tsx
   WebGL shader background hero — adapted for Croch_et Masterpiece
   Brand colors: #102C26 (deep green) + #F7E7CE (cream) + #c4843c (gold)
══════════════════════════════════════════════════════ */

interface ShaderHeroProps {
  children: React.ReactNode;
  className?: string;
}

// ── Custom shader tuned to brand palette (deep greens + warm gold glow) ──
const SHADER_SOURCE = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
uniform vec2 touch;
uniform vec2 move;
uniform int pointerCount;

#define FC gl_FragCoord.xy
#define T  time
#define R  resolution
#define MN min(R.x, R.y)

float rnd(vec2 p) {
  p = fract(p * vec2(12.9898, 78.233));
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

float noise(in vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  float a = rnd(i),
        b = rnd(i + vec2(1, 0)),
        c = rnd(i + vec2(0, 1)),
        d = rnd(i + 1.);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float t = .0, a = 1.;
  mat2 m = mat2(1., -.5, .2, 1.2);
  for (int i = 0; i < 5; i++) {
    t += a * noise(p);
    p *= 2. * m;
    a *= .5;
  }
  return t;
}

float clouds(vec2 p) {
  float d = 1., t = .0;
  for (float i = .0; i < 3.; i++) {
    float a = d * fbm(i * 10. + p.x * .2 + .2 * (1. + i) * p.y + d + i * i + p);
    t = mix(t, d, a);
    d = a;
    p *= 2. / (i + 1.);
  }
  return t;
}

void main(void) {
  vec2 uv = (FC - .5 * R) / MN;
  vec2 st = uv * vec2(2., 1.);

  // Brand base: deep forest green #102C26 → rgb(0.063, 0.173, 0.149)
  vec3 deepGreen  = vec3(0.063, 0.173, 0.149);
  // Mid green: #1a4a3a → rgb(0.102, 0.290, 0.227)
  vec3 midGreen   = vec3(0.102, 0.290, 0.227);
  // Gold accent: #c4843c → rgb(0.769, 0.518, 0.235)
  vec3 gold       = vec3(0.769, 0.518, 0.235);
  // Cream: #F7E7CE → rgb(0.969, 0.906, 0.808)
  vec3 cream      = vec3(0.969, 0.906, 0.808);

  float bg = clouds(vec2(st.x + T * .3, -st.y));

  uv *= 1. - .25 * (sin(T * .15) * .5 + .5);

  vec3 col = deepGreen * 0.8; // base dark green

  for (float i = 1.; i < 10.; i++) {
    uv += .08 * cos(i * vec2(.12 + .01 * i, .7) + i * i + T * .35 + .08 * uv.x);
    vec2 p = uv;
    float d = length(p);

    // Gold glow wisps
    col += .0012 / d * mix(gold, cream, sin(i * .7 + T * .2) * .5 + .5);

    float b = noise(i + p + bg * 1.5);
    col += .0018 * b / length(max(p, vec2(b * p.x * .02, p.y)));

    // Blend wisps with deep green fog
    col = mix(col, deepGreen * (bg * .5 + .2), d * .6);
  }

  // Subtle warm vignette at center
  float vignette = 1. - smoothstep(.3, 1.2, length(uv));
  col += gold * 0.04 * vignette * bg;

  // Very slight cream bloom at center top
  col = mix(col, midGreen, clamp(bg * .4, 0., .5));

  O = vec4(col, 1.0);
}`;

// ── WebGL renderer ────────────────────────────────────
class WebGLRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private vs: WebGLShader | null = null;
  private fs: WebGLShader | null = null;
  private buffer: WebGLBuffer | null = null;

  private vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){ gl_Position = position; }`;
  private vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl2")!;
  }

  compile(shader: WebGLShader, source: string) {
    const gl = this.gl;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader error:", gl.getShaderInfoLog(shader));
    }
  }

  setup() {
    const gl = this.gl;
    this.vs = gl.createShader(gl.VERTEX_SHADER)!;
    this.fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    this.compile(this.vs, this.vertexSrc);
    this.compile(this.fs, SHADER_SOURCE);
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, this.vs);
    gl.attachShader(this.program, this.fs);
    gl.linkProgram(this.program);
  }

  init() {
    const gl = this.gl;
    const prog = this.program!;
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    (prog as any).resolution    = gl.getUniformLocation(prog, "resolution");
    (prog as any).time          = gl.getUniformLocation(prog, "time");
    (prog as any).touch         = gl.getUniformLocation(prog, "touch");
    (prog as any).move          = gl.getUniformLocation(prog, "move");
    (prog as any).pointerCount  = gl.getUniformLocation(prog, "pointerCount");
  }

  render(now = 0) {
    const gl = this.gl;
    const prog = this.program;
    if (!prog) return;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.063, 0.173, 0.149, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.uniform2f((prog as any).resolution, this.canvas.width, this.canvas.height);
    gl.uniform1f((prog as any).time, now * 1e-3);
    gl.uniform2f((prog as any).touch, 0, 0);
    gl.uniform2f((prog as any).move,  0, 0);
    gl.uniform1i((prog as any).pointerCount, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  destroy() {
    const gl = this.gl;
    if (this.program) {
      if (this.vs) { gl.detachShader(this.program, this.vs); gl.deleteShader(this.vs); }
      if (this.fs) { gl.detachShader(this.program, this.fs); gl.deleteShader(this.fs); }
      gl.deleteProgram(this.program);
    }
  }
}

// ── Hook ─────────────────────────────────────────────
function useShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>();
  const rendererRef = useRef<WebGLRenderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);

    const resize = () => {
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();

    const renderer = new WebGLRenderer(canvas);
    rendererRef.current = renderer;
    renderer.setup();
    renderer.init();

    const loop = (now: number) => {
      renderer.render(now);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      renderer.destroy();
    };
  }, []);

  return canvasRef;
}

// ── Component ─────────────────────────────────────────
export default function ShaderHero({ children, className = "" }: ShaderHeroProps) {
  const canvasRef = useShaderBackground();

  return (
    <div className={`relative w-full overflow-hidden bg-brand-base ${className}`}>
      {/* WebGL canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none"
        style={{ background: "#07100d" }}
      />
      {/* Dark vignette overlay to keep text readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-base/30 via-transparent to-brand-base/70 pointer-events-none" />
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
