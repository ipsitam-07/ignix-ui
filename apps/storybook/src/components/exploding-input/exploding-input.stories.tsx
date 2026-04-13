import { useRef } from "react";
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
- 5 **particle presets**: \`confetti\`, \`sparks\`, \`stars\`, \`bubbles\`, \`letters\`
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
            options: ["confetti", "sparks", "stars", "bubbles", "letters"],
            description: "Style of the particles.",
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
        placeholder: "Type to see confetti...",
        triggerMode: "keypress",
        particlePreset: "confetti",
        direction: "up",
        audio: "pop",
    },
};

export const StarBurst: Story = {
    args: {
        placeholder: "Press Enter to burst...",
        triggerMode: "submit",
        particlePreset: "stars",
        direction: "burst",
        audio: "whoosh",
    },
};

export const SparksAndTrail: Story = {
    args: {
        placeholder: "Click to focus...",
        triggerMode: "focus",
        particlePreset: "sparks",
        direction: "radial",
        cursorTrail: true,
        audio: "sparkle",
    },
};

export const MagicalTypewriter: Story = {
    args: {
        placeholder: "Type magical characters...",
        triggerMode: "keypress",
        characterParticles: true,
        direction: "up",
        audio: "sparkle",
    },
};

export const BubbleWand: Story = {
    args: {
        placeholder: "Type and then clear the input...",
        triggerMode: "clear",
        particlePreset: "bubbles",
        direction: "down",
        audio: "pop",
    },
};

export const WithValidation: Story = {
    render: () => {
        const validate = (value: string) => {
            // Valid if length is greater than 5
            return value.length > 5;
        };

        return (
            <ExplodingInput
                placeholder="Needs at least 6 characters..."
                triggerMode="keypress"
                particlePreset="confetti"
                direction="radial"
                validate={validate}
                audio="pop"
            />
        );
    },
};

export const CustomTrigger: Story = {
    render: () => {
        const explodeRef = useRef<ExplodingInputHandle>(null);

        return (
            <div className="flex gap-4 items-center w-full">
                <ExplodingInput
                    explodeRef={explodeRef}
                    placeholder="Click the button ->"
                    triggerMode="custom"
                    particlePreset="stars"
                    direction="burst"
                    audio="whoosh"
                />
                <button
                    onClick={() => explodeRef.current?.explode()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow hover:bg-primary/90 transition-colors"
                >
                    Explode
                </button>
            </div>
        );
    },
};
