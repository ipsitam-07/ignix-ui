import * as React from 'react';
import { cn } from '../../../utils/cn';

const CANVAS_OVERHANG = 500;

//Types

type TriggerMode = "keypress" | "submit" | "focus" | "clear" | "custom";
type ParticlePreset = "confetti" | "sparks" | "stars" | "bubbles" | "letters" | "emoji";
type Direction = "up" | "down" | "left" | "right" | "radial" | "burst";
type AudioPreset = "pop" | "whoosh" | "sparkle";

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    spawnedAt: number;
    maxLifeMs: number;
    size: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    color: string;
    content: string;
    type: ParticlePreset;
    scale: number;
}

export interface ExplodingInputProps extends Omit<React.ComponentProps<"input">, "validate"> {
    triggerMode?: TriggerMode;
    particlePreset?: ParticlePreset;
    customEmoji?: string[];
    characterParticles?: boolean;
    direction?: Direction;
    cursorTrail?: boolean;
    validate?: (value: string) => boolean;
    maxParticles?: number;
    cleanup?: boolean;
    audio?: AudioPreset | string;
    explodeRef?: React.Ref<ExplodingInputHandle>;
}

export interface ExplodingInputHandle {
    explode: () => void;
}

//Preset Definitions

const CONFETTI_COLORS = [
    "hsl(0 90% 60%)",
    "hsl(45 95% 55%)",
    "hsl(120 70% 50%)",
    "hsl(200 90% 55%)",
    "hsl(280 80% 60%)",
    "hsl(330 85% 55%)",
];

const SPARK_COLORS = [
    "hsl(40 100% 70%)",
    "hsl(30 100% 60%)",
    "hsl(50 100% 80%)",
    "hsl(20 100% 55%)",
];

const STAR_COLORS = [
    "hsl(45 100% 60%)",
    "hsl(45 80% 80%)",
    "hsl(0 0% 95%)"
];

const BUBBLE_COLORS = [
    "hsla(200 80% 70% / 0.6)",
    "hsla(220 70% 75% / 0.5)",
    "hsla(180 60% 65% / 0.5)",
    "hsla(260 50% 75% / 0.4)",
]

const LETTER_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";

const DEFAULT_EMOJI = ["🤩", "👾", "😺", "👻", "🎃", "🖤", "🗯️", "✨", "🎉", "💥"];

function randomFrom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getPresetParticle(
    preset: ParticlePreset,
    char?: string,
    customEmoji?: string[]
): { content: string; color: string; size: number } {
    switch (preset) {
        case "confetti":
            return { content: "■", color: randomFrom(CONFETTI_COLORS), size: 8 + Math.random() * 6 };
        case "sparks":
            return { content: "•", color: randomFrom(SPARK_COLORS), size: 4 + Math.random() * 4 };
        case "stars":
            return { content: "★", color: randomFrom(STAR_COLORS), size: 10 + Math.random() * 8 };
        case "bubbles":
            return { content: "●", color: randomFrom(BUBBLE_COLORS), size: 8 + Math.random() * 12 };
        case "letters":
            return {
                content: char || randomFrom(LETTER_CHARS.split("")),
                color: randomFrom(CONFETTI_COLORS),
                size: 12 + Math.random() * 4,
            };
        case "emoji":
            return {
                content: randomFrom(customEmoji?.length ? customEmoji : DEFAULT_EMOJI),
                color: "#000000",
                size: 18 + Math.random() * 10,
            };
    }
}

//Direction Vectors

function getDirectionVelocity(direction: Direction, speed: number): { vx: number; vy: number } {
    const spread = () => (Math.random() - 0.5) * speed * 0.4;
    switch (direction) {
        case "up":
            return { vx: spread(), vy: -(speed * 0.5 + Math.random() * speed) };
        case "down":
            return { vx: spread(), vy: speed * 0.5 + Math.random() * speed };
        case "left":
            return { vx: -(speed * 0.5 + Math.random() * speed), vy: spread() };
        case "right":
            return { vx: speed * 0.5 + Math.random() * speed, vy: spread() };
        case "radial": {
            const angle = Math.random() * Math.PI * 2;
            const mag = speed * 0.5 + Math.random() * speed * 0.8;
            return { vx: Math.cos(angle) * mag, vy: Math.sin(angle) * mag };
        }
        case "burst": {
            const a = Math.random() * Math.PI * 2;
            const m = speed * 0.8 + Math.random() * speed;
            return { vx: Math.cos(a) * m, vy: Math.sin(a) * m };
        }
    }
}

//Typing speed tracker
class TypingSpeedTracker {
    private timestamps: number[] = [];
    private windowSize = 5;

    record() {
        this.timestamps.push(performance.now());
        if (this.timestamps.length > this.windowSize + 1) {
            this.timestamps.shift();
        }
    }

    getIntensity(): number {
        if (this.timestamps.length < 2) return 0.3;
        const intervals: number[] = [];
        for (let i = 1; i < this.timestamps.length; i++) {
            intervals.push(this.timestamps[i] - this.timestamps[i - 1]);
        }
        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const clamped = Math.max(50, Math.min(500, avg));
        return 1.0 - (clamped - 50) / 450;
    }

    getParticleCount(base = 8): number {
        const intensity = this.getIntensity();
        return Math.max(3, Math.round(base * (0.3 + intensity * 2.0)));
    }

    getSpeedMultiplier(): number {
        const intensity = this.getIntensity();
        return 0.5 + intensity * 2.5;
    }
}

//Audio Manager

class AudioManager {
    private ctx: AudioContext | null = null;
    private customBuffer: AudioBuffer | null = null;
    private preset: AudioPreset | string;
    private loadFailed = false;

    constructor(preset: AudioPreset | string) {
        this.preset = preset;
        if (!this.isBuiltinPreset(preset)) {
            this.loadCustom(preset);
        }
    }

    private isBuiltinPreset(p: string): p is AudioPreset {
        return p === "pop" || p === "sparkle" || p === "whoosh";
    }

    private getCtx(): AudioContext {
        if (!this.ctx) this.ctx = new AudioContext();
        return this.ctx;
    }

    private async loadCustom(url: string) {
        try {
            const ctx = this.getCtx();
            const res = await fetch(url);
            if (!res.ok) { this.loadFailed = true; return; }
            const buf = await res.arrayBuffer();
            this.customBuffer = await ctx.decodeAudioData(buf);
        } catch {
            this.loadFailed = true;
        }
    }

    play() {
        if (this.loadFailed && !this.isBuiltinPreset(this.preset)) return;
        try {
            if (this.isBuiltinPreset(this.preset)) {
                this.playBuiltin(this.preset);
            } else if (this.customBuffer) {
                this.playBuffer(this.customBuffer);
            }
        } catch {
            if (this.preset !== "pop") this.playBuiltin("pop");
        }
    }

    private playBuffer(buffer: AudioBuffer) {
        const ctx = this.getCtx();
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.value = 0.15;
        source.connect(gain).connect(ctx.destination);
        source.start();
    }

    private playBuiltin(preset: AudioPreset) {
        const ctx = this.getCtx();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.08;

        switch (preset) {
            case "pop":
                osc.type = "sine";
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc.connect(gain).connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case "sparkle":
                osc.type = "sine";
                osc.frequency.setValueAtTime(1200, now);
                osc.frequency.exponentialRampToValueAtTime(2400, now + 0.05);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                osc.connect(gain).connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.18);
                break;
            case "whoosh": {
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                const filter = ctx.createBiquadFilter();
                filter.type = "lowpass";
                filter.frequency.value = 1500;
                osc.connect(filter).connect(gain).connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            }
        }
    }

    dispose() {
        if (this.ctx) {
            this.ctx.close().catch(Object);
            this.ctx = null;
        }
    }
}

//Particle Engine Canvas Based
class ParticleEngine {
    private particles: Particle[] = [];
    private nextId = 0;
    private canvas: HTMLCanvasElement;
    private ctx2d: CanvasRenderingContext2D;
    private animFrame: number | null = null;
    private maxParticles: number;
    private running = false;
    customEmoji: string[] = [];

    constructor(canvas: HTMLCanvasElement, maxParticles: number) {
        this.canvas = canvas;
        this.ctx2d = canvas.getContext("2d")!;
        this.maxParticles = maxParticles;
    }

    spawn(
        x: number,
        y: number,
        count: number,
        preset: ParticlePreset,
        direction: Direction,
        speedMultiplier: number,
        colorOverride?: string,
        char?: string
    ) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) {
                this.particles.shift();
            }

            const p = getPresetParticle(preset, char, this.customEmoji);
            const vel = getDirectionVelocity(direction, 2 * speedMultiplier);
            const maxLifeMs = 800 + Math.random() * 800;

            this.particles.push({
                id: this.nextId++,
                x,
                y,
                vx: vel.vx,
                vy: vel.vy,
                spawnedAt: performance.now(),
                maxLifeMs,
                size: p.size,
                rotation: Math.random() * 360,
                rotationSpeed: preset === "emoji"
                    ? (Math.random() - 0.5) * 4
                    : (Math.random() - 0.5) * 10,
                opacity: 1,
                color: colorOverride || p.color,
                content: p.content,
                type: preset,
                scale: 1,
            });
        }

        if (!this.running) this.start();
    }

    private start() {
        this.running = true;
        const loop = (now: number) => {
            this.update(now);
            this.render();
            if (this.particles.length > 0) {
                this.animFrame = requestAnimationFrame(loop);
            } else {
                this.running = false;
            }
        };
        this.animFrame = requestAnimationFrame(loop);
    }

    private update(now: number) {
        const gravity = 0.15;
        const friction = 0.97;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            const elapsed = now - p.spawnedAt;
            const lifeRatio = Math.min(elapsed / p.maxLifeMs, 1);
            p.x += p.vx;
            p.y += p.vy;
            p.vy += gravity;
            p.vx *= friction;
            p.vy *= friction;
            p.rotation += p.rotationSpeed;
            p.opacity = 1 - lifeRatio;
            p.scale = 1 - lifeRatio * 0.3;

            if (lifeRatio >= 1) {
                this.particles.splice(i, 1);
            }
        }
    }

    private render() {
        const dpr = window.devicePixelRatio || 1;
        this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx2d.save();
        this.ctx2d.scale(dpr, dpr);

        for (const p of this.particles) {
            this.ctx2d.save();
            this.ctx2d.translate(p.x, p.y);
            this.ctx2d.rotate((p.rotation * Math.PI) / 180);
            this.ctx2d.globalAlpha = p.opacity;

            if (p.type === "sparks") {
                this.ctx2d.shadowBlur = 6;
                this.ctx2d.shadowColor = p.color;
            }

            if (p.type !== "emoji") {
                this.ctx2d.fillStyle = p.color;
            }

            const s = p.size * p.scale;
            this.ctx2d.font = `${s}px sans-serif`;
            this.ctx2d.textAlign = "center";
            this.ctx2d.textBaseline = "middle";
            this.ctx2d.fillText(p.content, 0, 0);

            this.ctx2d.shadowBlur = 0;
            this.ctx2d.restore();
        }

        this.ctx2d.restore();
    }

    clear() {
        this.particles = [];
        if (this.animFrame) {
            cancelAnimationFrame(this.animFrame);
            this.animFrame = null;
        }
        this.running = false;
        this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    dispose() {
        this.clear();
    }
}


//Cursor Position Helper
function getCursorPixelPosition(
    input: HTMLInputElement,
    container: HTMLElement
): { x: number; y: number } {
    const inputRect = input.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const span = document.createElement("span");
    const style = window.getComputedStyle(input);
    span.style.font = style.font;
    span.style.fontSize = style.fontSize;
    span.style.fontFamily = style.fontFamily;
    span.style.letterSpacing = style.letterSpacing;
    span.style.visibility = "hidden";
    span.style.position = "absolute";
    span.style.whiteSpace = "pre";
    document.body.appendChild(span);

    const pos = input.selectionStart ?? input.value.length;
    span.textContent = input.value.substring(0, pos);
    const textWidth = span.offsetWidth;
    document.body.removeChild(span);

    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const scrollLeft = input.scrollLeft || 0;

    return {
        x: inputRect.left - containerRect.left + paddingLeft + textWidth - scrollLeft,
        y: inputRect.top - containerRect.top + inputRect.height / 2 + CANVAS_OVERHANG,
    };
}

//Reduced Motion Hook
function usePrefersReducedMotion(): boolean {
    const [reduced, setReduced] = React.useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    });

    React.useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    return reduced;
}

//Component
const ExplodingInput = React.forwardRef<HTMLInputElement, ExplodingInputProps>(
    (
        {
            className,
            triggerMode = "keypress",
            particlePreset = "confetti",
            customEmoji,
            characterParticles = false,
            direction = "up",
            cursorTrail = false,
            validate,
            maxParticles = 150,
            audio,
            explodeRef,
            type,
            onChange,
            onFocus,
            onKeyDown,
            ...props
        },
        ref
    ) => {
        const reducedMotion = usePrefersReducedMotion();
        const containerRef = React.useRef<HTMLDivElement>(null);
        const canvasRef = React.useRef<HTMLCanvasElement>(null);
        const inputRef = React.useRef<HTMLInputElement>(null);
        const engineRef = React.useRef<ParticleEngine | null>(null);
        const audioRef = React.useRef<AudioManager | null>(null);
        const speedTracker = React.useRef(new TypingSpeedTracker());
        const trailTimer = React.useRef<number | null>(null);
        const prevValueRef = React.useRef("");

        React.useImperativeHandle(ref, () => inputRef.current!);
        React.useImperativeHandle(explodeRef, () => ({
            explode: () => fireExplosion(undefined, 40, 2.5),
        }));

        React.useEffect(() => {
            if (engineRef.current) {
                engineRef.current.customEmoji = customEmoji ?? [];
            }
        }, [customEmoji]);

        React.useEffect(() => {
            if (reducedMotion) return;
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;

            const resize = () => {
                const dpr = window.devicePixelRatio || 1;
                const rect = container.getBoundingClientRect();
                canvas.width = rect.width * dpr;
                canvas.height = (rect.height + CANVAS_OVERHANG * 2) * dpr;
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height + CANVAS_OVERHANG * 2}px`;
            };
            resize();

            const ro = new ResizeObserver(resize);
            ro.observe(container);

            const engine = new ParticleEngine(canvas, maxParticles);
            engine.customEmoji = customEmoji ?? [];
            engineRef.current = engine;

            return () => {
                ro.disconnect();
                engineRef.current?.dispose();
                engineRef.current = null;
            };
        }, [reducedMotion, maxParticles]);

        React.useEffect(() => {
            if (!audio || reducedMotion) {
                audioRef.current?.dispose();
                audioRef.current = null;
                return;
            }
            audioRef.current = new AudioManager(audio);
            return () => {
                audioRef.current?.dispose();
                audioRef.current = null;
            };
        }, [audio, reducedMotion]);

        const getValidationColor = React.useCallback((): string | undefined => {
            if (!validate || !inputRef.current) return undefined;
            const valid = validate(inputRef.current.value);
            return valid ? "hsl(140 70% 45%)" : "hsl(0 80% 55%)";
        }, [validate]);

        const fireExplosion = React.useCallback(
            (char?: string, overrideCount?: number, overrideSpeed?: number) => {
                if (reducedMotion || !engineRef.current || !inputRef.current || !containerRef.current) return;

                const pos = getCursorPixelPosition(inputRef.current, containerRef.current);
                const preset = characterParticles && char ? "letters" : particlePreset;
                const charToUse = characterParticles && char ? char : undefined;
                const count = overrideCount ?? speedTracker.current.getParticleCount();
                const speed = overrideSpeed ?? speedTracker.current.getSpeedMultiplier();
                const color = particlePreset === "emoji" ? undefined : getValidationColor();

                engineRef.current.spawn(pos.x, pos.y, count, preset, direction, speed, color, charToUse);
                audioRef.current?.play();
            },
            [reducedMotion, characterParticles, particlePreset, direction, getValidationColor]
        );

        const fireTrailParticle = React.useCallback(() => {
            if (reducedMotion || !engineRef.current || !inputRef.current || !containerRef.current) return;
            const pos = getCursorPixelPosition(inputRef.current, containerRef.current);
            const color = particlePreset === "emoji" ? undefined : getValidationColor();
            engineRef.current.spawn(pos.x, pos.y, 1, "sparks", "radial", 0.3, color);
        }, [reducedMotion, particlePreset, getValidationColor]);

        const handleChange = React.useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const newValue = e.target.value;
                const prevValue = prevValueRef.current;

                if (triggerMode === "keypress") {
                    speedTracker.current.record();
                    if (newValue.length > prevValue.length) {
                        const typed = newValue[newValue.length - 1];
                        fireExplosion(typed);
                    }
                }

                if (triggerMode === "clear" && newValue === "" && prevValue !== "") {
                    fireExplosion(undefined, 30, 2.0);
                }

                prevValueRef.current = newValue;
                onChange?.(e);
            },
            [triggerMode, fireExplosion, onChange]
        );

        const handleKeyDown = React.useCallback(
            (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (triggerMode === "submit" && e.key === "Enter") {
                    fireExplosion(undefined, 60, 2.8);
                }
                onKeyDown?.(e);
            },
            [triggerMode, fireExplosion, onKeyDown]
        );

        const handleFocus = React.useCallback(
            (e: React.FocusEvent<HTMLInputElement>) => {
                if (triggerMode === "focus") {
                    fireExplosion(undefined, 25, 1.5);
                }

                if (cursorTrail && !reducedMotion) {
                    const trail = () => {
                        fireTrailParticle();
                        trailTimer.current = window.setTimeout(trail, 80);
                    };
                    trailTimer.current = window.setTimeout(trail, 80);
                }

                onFocus?.(e);
            },
            [triggerMode, cursorTrail, reducedMotion, fireExplosion, fireTrailParticle, onFocus]
        );

        const handleBlur = React.useCallback(() => {
            if (trailTimer.current) {
                clearTimeout(trailTimer.current);
                trailTimer.current = null;
            }
        }, []);

        React.useEffect(() => {
            return () => {
                if (trailTimer.current) clearTimeout(trailTimer.current);
            };
        }, []);

        return (
            <div ref={containerRef} className="relative inline-block w-full overflow-visible">
                <canvas
                    ref={canvasRef}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 z-10"
                    style={{ top: -CANVAS_OVERHANG }}
                />
                <input
                    ref={inputRef}
                    type={type}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        className
                    )}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />
            </div>
        );
    }
);

ExplodingInput.displayName = "ExplodingInput";

export { ExplodingInput };
