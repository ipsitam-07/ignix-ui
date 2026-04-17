import * as React from 'react';
import {
    render,
    fireEvent,
    act,
    waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { ExplodingInput, ExplodingInputHandle } from './index';

// Canvas
class MockCanvasRenderingContext2D {
    clearRect = vi.fn();
    save = vi.fn();
    restore = vi.fn();
    translate = vi.fn();
    rotate = vi.fn();
    fillRect = vi.fn();
    beginPath = vi.fn();
    arc = vi.fn();
    fill = vi.fn();
    lineTo = vi.fn();
    closePath = vi.fn();
    fillText = vi.fn();
    drawImage = vi.fn();
    scale = vi.fn();
    setTransform = vi.fn();
    measureText = vi.fn(() => ({ width: 10 }));
    fillStyle = '';
    font = '';
    textAlign = '';
    textBaseline = '';
    globalAlpha = 1;
    shadowBlur = 0;
    shadowColor = '';
}

const mockCtx = new MockCanvasRenderingContext2D();

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx) as any;

class MockResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    constructor(cb: ResizeObserverCallback) {
        setTimeout(() =>
            cb(
                [{ contentRect: { width: 300, height: 40 } } as ResizeObserverEntry],
                this as unknown as ResizeObserver
            ),
            0
        );
    }
}
vi.stubGlobal('ResizeObserver', MockResizeObserver);

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

class MockOscillatorNode {
    type = 'sine';
    frequency = {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
    };
    connect = vi.fn(() => ({ connect: vi.fn(() => ({ connect: vi.fn() })) }));
    start = vi.fn();
    stop = vi.fn();
}

class MockGainNode {
    gain = {
        value: 1,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
    };
    connect = vi.fn(() => ({ connect: vi.fn() }));
}

class MockBiquadFilterNode {
    type = 'lowpass';
    frequency = { value: 1500 };
    connect = vi.fn(() => ({ connect: vi.fn(() => ({ connect: vi.fn() })) }));
}

class MockAudioContext {
    currentTime = 0;
    destination = {};
    createOscillator = vi.fn(() => new MockOscillatorNode());
    createGain = vi.fn(() => new MockGainNode());
    createBiquadFilter = vi.fn(() => new MockBiquadFilterNode());
    createBufferSource = vi.fn(() => ({
        buffer: null,
        connect: vi.fn(() => ({ connect: vi.fn() })),
        start: vi.fn(),
    }));
    decodeAudioData = vi.fn(() => Promise.resolve({}));
    close = vi.fn(() => Promise.resolve());
}

const MockAudioContextConstructor = vi.fn(() => new MockAudioContext());
vi.stubGlobal('AudioContext', MockAudioContextConstructor);

vi.stubGlobal('performance', { now: vi.fn(() => Date.now()) });

vi.stubGlobal('requestAnimationFrame', vi.fn((cb: FrameRequestCallback) => {
    const id = window.setTimeout(() => cb(performance.now()), 16);
    return id as unknown as number;
}));
vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => clearTimeout(id)));

function renderInput(props: React.ComponentProps<typeof ExplodingInput> = {}) {
    return render(<ExplodingInput placeholder="Type here" {...props} />);
}

function getInput() {
    return document.querySelector('input') as HTMLInputElement;
}

describe('Rendering', () => {
    it('renders an <input> element', () => {
        renderInput();
        expect(getInput()).toBeInTheDocument();
    });

    it('renders a <canvas> element', () => {
        const { container } = renderInput();
        expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('canvas has aria-hidden="true"', () => {
        const { container } = renderInput();
        expect(container.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true');
    });

    it('passes through standard input props (placeholder, disabled)', () => {
        renderInput({ placeholder: 'hello', disabled: true });
        const input = getInput();
        expect(input).toHaveAttribute('placeholder', 'hello');
        expect(input).toBeDisabled();
    });

    it('passes through className to the input', () => {
        renderInput({ className: 'custom-class' });
        expect(getInput()).toHaveClass('custom-class');
    });

    it('passes through type prop', () => {
        renderInput({ type: 'password' });
        expect(getInput()).toHaveAttribute('type', 'password');
    });

    it('forwards ref to the underlying input element', () => {
        const ref = React.createRef<HTMLInputElement>();
        render(<ExplodingInput ref={ref} />);
        expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
});

describe('Input value behaviour', () => {
    it('accepts typed characters', async () => {
        const user = userEvent.setup();
        renderInput();
        await user.type(getInput(), 'hello');
        expect(getInput()).toHaveValue('hello');
    });

    it('calls onChange with each keystroke', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        renderInput({ onChange });
        await user.type(getInput(), 'ab');
        expect(onChange).toHaveBeenCalledTimes(2);
    });

    it('works as a controlled input', () => {
        const { rerender } = render(<ExplodingInput value="foo" onChange={vi.fn()} />);
        expect(getInput()).toHaveValue('foo');
        rerender(<ExplodingInput value="bar" onChange={vi.fn()} />);
        expect(getInput()).toHaveValue('bar');
    });
});

describe('triggerMode: keypress', () => {
    it('fires spawn on typing a character', async () => {
        const user = userEvent.setup();
        renderInput({ triggerMode: 'keypress', particlePreset: 'confetti' });
        await user.type(getInput(), 'x');
        await waitFor(() => expect(mockCtx.clearRect).toHaveBeenCalled());
    });

    it('fires spawn on backspace (deletion)', async () => {
        const user = userEvent.setup();
        renderInput({ triggerMode: 'keypress' });
        await user.type(getInput(), 'a');
        await waitFor(() => expect(mockCtx.clearRect).toHaveBeenCalled());
        mockCtx.clearRect.mockClear();
        await user.type(getInput(), '{backspace}');
        await waitFor(() => expect(mockCtx.clearRect).toHaveBeenCalled());
    });
});

describe('triggerMode: submit', () => {
    it('fires a bigger burst on Enter keydown', async () => {
        const user = userEvent.setup();
        const onKeyDown = vi.fn();
        renderInput({ triggerMode: 'submit', onKeyDown });
        const input = getInput();
        await user.type(input, 'test');
        await waitFor(() => expect(mockCtx.clearRect).toHaveBeenCalled());
        mockCtx.clearRect.mockClear();
        await user.keyboard('{Enter}');
        await waitFor(() => expect(mockCtx.clearRect).toHaveBeenCalled());
    });

    it('calls the user-supplied onKeyDown handler', async () => {
        const user = userEvent.setup();
        const onKeyDown = vi.fn();
        renderInput({ triggerMode: 'submit', onKeyDown });
        await user.type(getInput(), '{Enter}');
        expect(onKeyDown).toHaveBeenCalled();
    });

    it('does NOT explode on non-Enter keys', async () => {
        renderInput({ triggerMode: 'submit' });
        mockCtx.clearRect.mockClear();
        fireEvent.keyDown(getInput(), { key: 'a' });
        expect(mockCtx.clearRect).not.toHaveBeenCalled();
    });
});

describe('triggerMode: focus', () => {
    it('fires explosion when the input is focused', async () => {
        vi.useFakeTimers();
        renderInput({ triggerMode: 'focus' });
        fireEvent.focus(getInput());
        await act(async () => {
            vi.advanceTimersByTime(50);
        });
        expect(mockCtx.clearRect).toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('calls user-supplied onFocus handler', () => {
        const onFocus = vi.fn();
        renderInput({ triggerMode: 'focus', onFocus });
        fireEvent.focus(getInput());
        expect(onFocus).toHaveBeenCalled();
    });
});

describe('triggerMode: clear', () => {
    it('fires a burst when the field is fully cleared', async () => {
        const user = userEvent.setup();
        renderInput({ triggerMode: 'clear' });
        await user.type(getInput(), 'hi');
        await waitFor(() => expect(mockCtx.clearRect).toHaveBeenCalled());
        mockCtx.clearRect.mockClear();
        await user.clear(getInput());
        await waitFor(() => expect(mockCtx.clearRect).toHaveBeenCalled());
    });

    it('fires a smaller burst on partial deletion', async () => {
        const user = userEvent.setup();
        renderInput({ triggerMode: 'clear' });
        await user.type(getInput(), 'abc');
        await waitFor(() => expect(mockCtx.clearRect).toHaveBeenCalled());
        mockCtx.clearRect.mockClear();
        await user.type(getInput(), '{backspace}');
        await waitFor(() => expect(mockCtx.clearRect).toHaveBeenCalled());
    });
});

describe('cursorTrail', () => {
    it('starts a trail timer on focus when cursorTrail=true', () => {
        vi.useFakeTimers();
        renderInput({ cursorTrail: true });
        fireEvent.focus(getInput());
        act(() => { vi.advanceTimersByTime(200); });
        expect(mockCtx.clearRect).toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('stops the trail timer on blur', () => {
        vi.useFakeTimers();
        const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
        renderInput({ cursorTrail: true });
        fireEvent.focus(getInput());
        act(() => { vi.advanceTimersByTime(100); });
        fireEvent.blur(getInput());
        expect(clearTimeoutSpy).toHaveBeenCalled();
        vi.useRealTimers();
    });
});

describe('validate prop', () => {
    it('passes validation result (valid) to particle color logic without throwing', async () => {
        const user = userEvent.setup();
        const validate = vi.fn(() => true);
        renderInput({ validate, triggerMode: 'keypress' });
        await user.type(getInput(), 'ok');
        expect(validate).toHaveBeenCalled();
    });

    it('passes validation result (invalid) without throwing', async () => {
        const user = userEvent.setup();
        const validate = vi.fn(() => false);
        renderInput({ validate, triggerMode: 'keypress' });
        await user.type(getInput(), 'bad');
        expect(validate).toHaveBeenCalled();
    });
});

describe('explodeRef imperative handle', () => {
    it('exposes an explode() method via explodeRef', () => {
        const explodeRef = React.createRef<ExplodingInputHandle>();
        render(<ExplodingInput explodeRef={explodeRef} />);
        expect(typeof explodeRef.current?.explode).toBe('function');
    });

    it('calling explode() triggers particle spawn (canvas is used)', async () => {
        const explodeRef = React.createRef<ExplodingInputHandle>();
        render(<ExplodingInput explodeRef={explodeRef} />);
        mockCtx.clearRect.mockClear();
        act(() => { explodeRef.current?.explode(); });
        await waitFor(() => expect(mockCtx.clearRect).toHaveBeenCalled());
    });
});

describe('particlePreset prop', () => {
    const presets = ['confetti', 'sparks', 'stars', 'bubbles', 'letters', 'emoji'] as const;

    presets.forEach(preset => {
        it(`renders without error with preset="${preset}"`, async () => {
            const user = userEvent.setup();
            renderInput({ particlePreset: preset, triggerMode: 'keypress' });
            await expect(user.type(getInput(), 'a')).resolves.not.toThrow();
        });
    });
});

describe('direction prop', () => {
    const directions = ['up', 'down', 'left', 'right', 'radial', 'burst'] as const;

    directions.forEach(dir => {
        it(`renders without error with direction="${dir}"`, async () => {
            const user = userEvent.setup();
            renderInput({ direction: dir, triggerMode: 'keypress' });
            await expect(user.type(getInput(), 'x')).resolves.not.toThrow();
        });
    });
});

describe('characterParticles', () => {
    it('does not throw when characterParticles=true', async () => {
        const user = userEvent.setup();
        renderInput({ characterParticles: true, triggerMode: 'keypress' });
        await expect(user.type(getInput(), 'A')).resolves.not.toThrow();
    });
});

describe('customEmoji', () => {
    it('accepts a custom emoji array without throwing', async () => {
        const user = userEvent.setup();
        renderInput({
            particlePreset: 'emoji',
            customEmoji: ['🔥', '💧'],
            triggerMode: 'keypress',
        });
        await expect(user.type(getInput(), 'e')).resolves.not.toThrow();
    });

    it('updates customEmoji on re-render without error', () => {
        const { rerender } = renderInput({
            particlePreset: 'emoji',
            customEmoji: ['🔥'],
        });
        expect(() =>
            rerender(
                <ExplodingInput particlePreset="emoji" customEmoji={['💧', '🌊']} />
            )
        ).not.toThrow();
    });
});

describe('audio prop', () => {
    it('instantiates AudioManager with preset "pop"', () => {
        expect(() => renderInput({ audio: 'pop' })).not.toThrow();
    });

    it('instantiates AudioManager with preset "sparkle"', () => {
        expect(() => renderInput({ audio: 'sparkle' })).not.toThrow();
    });

    it('instantiates AudioManager with preset "whoosh"', () => {
        expect(() => renderInput({ audio: 'whoosh' })).not.toThrow();
    });

    it('plays audio on keypress', async () => {
        const user = userEvent.setup();
        const mockAudioCtx = new MockAudioContext();
        vi.mocked(AudioContext).mockImplementation(() => mockAudioCtx as any);
        renderInput({ audio: 'pop', triggerMode: 'keypress' });
        await user.type(getInput(), 'z');
        expect(mockAudioCtx.createOscillator).toHaveBeenCalled();
    });
});

describe('maxParticles', () => {
    it('accepts maxParticles prop without error', () => {
        expect(() => renderInput({ maxParticles: 50 })).not.toThrow();
    });
});

describe('prefers-reduced-motion', () => {
    it('suppresses particle spawning when reduced motion is preferred', async () => {
        window.matchMedia = vi.fn((query: string) => ({
            matches: query.includes('reduce'),
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));

        const user = userEvent.setup();
        mockCtx.clearRect.mockClear();
        renderInput({ triggerMode: 'keypress' });
        await user.type(getInput(), 'abc');
        expect(mockCtx.clearRect).not.toHaveBeenCalled();

        window.matchMedia = vi.fn((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));
    });
});

describe('Cleanup on unmount', () => {
    it('unmounts without throwing', () => {
        const { unmount } = renderInput();
        expect(() => unmount()).not.toThrow();
    });

    it('cancels trail timer on unmount', () => {
        vi.useFakeTimers();
        const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
        const { unmount } = renderInput({ cursorTrail: true });
        fireEvent.focus(getInput());
        act(() => { vi.advanceTimersByTime(100); });
        unmount();
        expect(clearTimeoutSpy).toHaveBeenCalled();
        vi.useRealTimers();
    });
});

describe('Typing speed tracker', () => {
    it('handles rapid successive keystrokes without error', async () => {
        const user = userEvent.setup({ delay: 20 });
        renderInput({ triggerMode: 'keypress' });
        await expect(
            user.type(getInput(), 'abcdefghij')
        ).resolves.not.toThrow();
    });

    it('handles slow successive keystrokes without error', async () => {
        const user = userEvent.setup({ delay: 300 });
        renderInput({ triggerMode: 'keypress' });
        await expect(
            user.type(getInput(), 'ab')
        ).resolves.not.toThrow();
    });
});

describe('Texture caching in ParticleEngine', () => {
    it('reuses cached canvas instead of creating a new one for same glyph', async () => {
        const _random = Math.random;
        Math.random = () => 0.5;
        const createElementSpy = vi.spyOn(document, 'createElement');
        const user = userEvent.setup();
        renderInput({ particlePreset: 'letters', triggerMode: 'keypress' });

        await user.type(getInput(), 'aaa');

        const canvasCalls = createElementSpy.mock.calls.filter(
            ([tag]) => tag === 'canvas'
        );
        expect(canvasCalls.length).toBeLessThan(6);
        createElementSpy.mockRestore();
        Math.random = _random;
    });
});

describe('Cursor pixel position measurement', () => {
    it('appends a hidden measurement span to the body', async () => {
        const user = userEvent.setup();
        renderInput({ triggerMode: 'keypress' });
        await user.type(getInput(), 'x');
        const span = document.body.querySelector('span');
        expect(span).not.toBeNull();
        expect(span?.style.visibility).toBe('hidden');
    });
});

describe('displayName', () => {
    it('has displayName "ExplodingInput"', () => {
        expect(ExplodingInput.displayName).toBe('ExplodingInput');
    });
});