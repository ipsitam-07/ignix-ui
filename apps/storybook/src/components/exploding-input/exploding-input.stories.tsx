import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ExplodingInput, type ExplodingInputHandle } from "./index";

const meta: Meta<typeof ExplodingInput> = {
    title: "Components/ExplodingInput",
    component: ExplodingInput,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
The **ExplodingInput** component is a highly interactive input field that fires canvas-based particle explosions on various triggers.
It supports multiple interactive modes, customized presets, directional animations, and audio effects.

### Features
- 5 **trigger modes**: \`keypress\`, \`submit\`, \`focus\`, \`clear\`, \`custom\`
- 6 **particle presets**: \`confetti\`, \`sparks\`, \`stars\`, \`bubbles\`, \`letters\`, \`emoji\`
- Built-in **audio** effects (\`pop\`, \`whoosh\`, \`sparkle\`) or custom URLs
- **Directional** control (\`up\`, \`down\`, \`left\`, \`right\`, \`radial\`, \`burst\`)
- **Validation** support (colors particles green/red based on validity)
- **Cursor trailing** mode for focus effects
- Responsive and handles system \`prefers-reduced-motion\` gracefully.
        `,
            },
        },
    },
    argTypes: {
        triggerMode: {
            control: "select",
            options: ["keypress", "submit", "focus", "clear", "custom"],
            description: "Event that triggers the explosion.",
        },
        particlePreset: {
            control: "select",
            options: ["confetti", "sparks", "stars", "bubbles", "letters", "emoji"],
            description: "Style of the particles.",
        },
        customEmoji: {
            control: "object",
            description: "Custom array of emojis to use for the 'emoji' preset.",
        },
        direction: {
            control: "select",
            options: ["up", "down", "left", "right", "radial", "burst"],
            description: "Direction the particles fly.",
        },
        characterParticles: {
            control: "boolean",
            description: "Emit the typed character as the particle instead of shapes.",
        },
        cursorTrail: {
            control: "boolean",
            description: "Emit particles trailing behind the cursor while focused.",
        },
        audio: {
            control: "select",
            options: ["pop", "whoosh", "sparkle", "none"],
            mapping: { none: undefined },
            description: "Sound effect played on trigger.",
        },
        maxParticles: {
            control: "number",
            description: "Maximum particles on screen at once to avoid lag.",
        },
    },
    decorators: [
        (Story) => (
            <div className="flex min-h-[500px] w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="w-full max-w-md">
                    <Story />
                </div>
            </div>
        ),
    ],
};
export default meta;

type Story = StoryObj<typeof ExplodingInput>;

export const Default: Story = {
    args: {
        placeholder: "Start typing to celebration...",
        triggerMode: "keypress",
        particlePreset: "confetti",
        direction: "up",
        audio: "pop",
    },
};

export const BurstFire: Story = {
    args: {
        placeholder: "Type something and hit Enter...",
        triggerMode: "submit",
        particlePreset: "stars",
        direction: "burst",
        audio: "whoosh",
    },
};

export const Clear: Story = {
    args: {
        placeholder: "Type then backspace everything...",
        triggerMode: "clear",
        particlePreset: "emoji",
        direction: "down",
        audio: "pop",
    },
};

export const MagicalTrail: Story = {
    args: {
        placeholder: "Click here to see the magic...",
        triggerMode: "focus",
        particlePreset: "sparks",
        direction: "radial",
        cursorTrail: true,
        audio: "sparkle",
    },
};

export const ValidationPlayground: Story = {
    render: (args) => {
        const [isValid, setIsValid] = useState(false);
        const validate = (val: string) => {
            const ok = val.length >= 8 && /[0-9]/.test(val);
            setIsValid(ok);
            return ok;
        };

        return (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Create Password
                    </label>
                    <ExplodingInput
                        {...args}
                        placeholder="8+ chars, 1 number..."
                        triggerMode="keypress"
                        particlePreset="confetti"
                        direction="radial"
                        validate={validate}
                        audio="pop"
                        type="password"
                    />
                </div>
                <p className={`text-sm font-medium transition-colors ${isValid ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
                    {isValid ? "✨ Password meets requirements!" : "Need 8 characters and 1 number."}
                </p>
            </div>
        );
    },
};

export const TypeWriter: Story = {
    args: {
        placeholder: "A mechanical typewriter feel...",
        triggerMode: "keypress",
        characterParticles: true,
        direction: "up",
        audio: "pop",
    },
};

export const CustomControl: Story = {
    render: (args) => {
        const explodeRef = useRef<ExplodingInputHandle>(null);

        return (
            <div className="flex w-full items-center gap-3">
                <ExplodingInput
                    {...args}
                    explodeRef={explodeRef}
                    placeholder="Explicit control..."
                    triggerMode="custom"
                    particlePreset="bubbles"
                    direction="burst"
                    audio="pop"
                />
                <button
                    onClick={() => explodeRef.current?.explode()}
                    className="shrink-0 rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                    Fire!
                </button>
            </div>
        );
    },
};

export const CuratedEmoji: Story = {
    args: {
        placeholder: "Only hearts and sparks...",
        triggerMode: "keypress",
        particlePreset: "emoji",
        customEmoji: ["💖", "✨", "🔥", "🦄"],
        direction: "up",
        audio: "sparkle",
    },
};

export const AllVariants: Story = {
    render: (args) => {
        const explodeRef = useRef<ExplodingInputHandle>(null);
        return (
            <div className="flex w-full flex-col gap-6">
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confetti Up (Keypress)</label>
                    <ExplodingInput {...args} placeholder="Type to pop..." triggerMode="keypress" particlePreset="confetti" direction="up" audio="pop" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sparks Radial (Focus Trail)</label>
                    <ExplodingInput {...args} placeholder="Click to focus..." triggerMode="focus" particlePreset="sparks" cursorTrail direction="radial" audio="sparkle" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Emoji Down (Clear mode)</label>
                    <ExplodingInput {...args} placeholder="Type, then backspace all..." triggerMode="clear" particlePreset="emoji" direction="down" audio="pop" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Letters Burst (Keypress)</label>
                    <ExplodingInput {...args} placeholder="Type to spawn characters..." triggerMode="keypress" characterParticles direction="burst" audio="whoosh" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Stars Left (Submit / Enter)</label>
                    <ExplodingInput {...args} placeholder="Type and press Enter..." triggerMode="submit" particlePreset="stars" direction="left" audio="sparkle" />
                </div>
                <div className="space-y-1 flex flex-col">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Bubbles Right (Custom Trigger)</label>
                    <div className="flex gap-2">
                        <ExplodingInput {...args} explodeRef={explodeRef} placeholder="Wait for click..." triggerMode="custom" particlePreset="bubbles" direction="right" audio="pop" />
                        <button
                            onClick={() => explodeRef.current?.explode()}
                            className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                        >
                            Fire
                        </button>
                    </div>
                </div>
            </div>
        );
    },
};
