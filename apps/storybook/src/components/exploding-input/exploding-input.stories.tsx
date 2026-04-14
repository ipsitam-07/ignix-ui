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

export const RainyDay: Story = {
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
            <div className="space-y-4">
                <ExplodingInput
                    {...args}
                    placeholder="Enter a secure password (8+ chars, 1 number)..."
                    triggerMode="keypress"
                    particlePreset="confetti"
                    direction="radial"
                    validate={validate}
                    audio="pop"
                />
                <p className={`text-xs font-semibold ${isValid ? 'text-green-500' : 'text-slate-400'}`}>
                    {isValid ? "✨ Password looks strong!" : "Enter 8 characters with at least one number."}
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
            <div className="flex gap-3 items-center w-full">
                <ExplodingInput
                    {...args}
                    explodeRef={explodeRef}
                    placeholder="Control explicitly..."
                    triggerMode="custom"
                    particlePreset="bubbles"
                    direction="burst"
                    audio="pop"
                />
                <button
                    onClick={() => explodeRef.current?.explode()}
                    className="shrink-0 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
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
