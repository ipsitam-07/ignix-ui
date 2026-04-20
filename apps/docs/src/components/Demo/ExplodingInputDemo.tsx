import React, { useState, useRef } from 'react';
import { ExplodingInput, ExplodingInputHandle } from '@site/src/components/UI/exploding-input';
import VariantSelector from './VariantSelector';
import { Switch } from '@site/src/components/UI/switch';
import { Button } from '@site/src/components/UI/button';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

const presetVariants = ['confetti', 'sparks', 'stars', 'bubbles', 'letters', 'emoji'];
const triggerModes = ['keypress', 'submit', 'focus', 'clear', 'custom'];
const directions = ['up', 'down', 'left', 'right', 'radial', 'burst'];
const audios = ['none', 'pop', 'whoosh', 'sparkle'];

const ExplodingInputDemo = () => {
  const [preset, setPreset] = useState('confetti');
  const [triggerMode, setTriggerMode] = useState('keypress');
  const [direction, setDirection] = useState('up');
  const [audio, setAudio] = useState('none');
  const [characterParticles, setCharacterParticles] = useState(false);
  const [cursorTrail, setCursorTrail] = useState(false);
  const [value, setValue] = useState('');

  const explodeRef = useRef<ExplodingInputHandle>(null);

  const getPlaceholder = () => {
    switch (triggerMode) {
      case 'submit': return 'Press Enter to explode...';
      case 'focus': return 'Click to focus...';
      case 'clear': return 'Type and then clear...';
      case 'custom': return 'Type here or click "Fire!"...';
      default: return 'Type here...';
    }
  };

  const renderPropsCode = () => {
    let propsStr = '';
    propsStr += `\n      particlePreset="${preset}"`;
    propsStr += `\n      triggerMode="${triggerMode}"`;
    propsStr += `\n      direction="${direction}"`;
    if (audio !== 'none') propsStr += `\n      audio="${audio}"`;
    if (characterParticles) propsStr += `\n      characterParticles={true}`;
    if (cursorTrail) propsStr += `\n      cursorTrail={true}`;
    return propsStr;
  };

  const codeString = `import { ExplodingInput } from '@ignix-ui/exploding-input';

  <ExplodingInput
    placeholder="${getPlaceholder()}"${renderPropsCode()}
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
`;

  return (
    <div className="flex flex-col space-y-4 mb-8">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-0 sm:justify-end justify-end">
        <VariantSelector
          variants={presetVariants}
          selectedVariant={preset}
          onSelectVariant={setPreset}
          type="Preset"
        />
        <VariantSelector
          variants={triggerModes}
          selectedVariant={triggerMode}
          onSelectVariant={setTriggerMode}
          type="Trigger Mode"
        />
        <VariantSelector
          variants={directions}
          selectedVariant={direction}
          onSelectVariant={setDirection}
          type="Direction"
        />
        <VariantSelector
          variants={audios}
          selectedVariant={audio}
          onSelectVariant={setAudio}
          type="Audio"
        />

        <div className="flex flex-row gap-4 items-start px-2">
          <div className="flex items-center space-x-2 py-1">
            <Switch
              checked={characterParticles}
              onCheckedChange={setCharacterParticles}
              variant="small"
            />
            <span className="text-sm font-medium">Typed Characters (Letters)</span>
          </div>
          <div className="flex items-center space-x-2 py-1">
            <Switch
              checked={cursorTrail}
              onCheckedChange={setCursorTrail}
              variant="small"
            />
            <span className="text-sm font-medium">Cursor Trail</span>
          </div>
        </div>
      </div>

      <Tabs>
        <TabItem value="preview" label="Preview">
          <div className="p-4 border rounded-lg mt-4 flex items-center justify-center min-h-[100px]">
            <div className="w-full max-w-lg flex items-center gap-2">
              <ExplodingInput
                explodeRef={explodeRef}
                placeholder={getPlaceholder()}
                particlePreset={preset as any}
                triggerMode={triggerMode as any}
                direction={direction as any}
                audio={audio === 'none' ? undefined : audio}
                characterParticles={characterParticles}
                cursorTrail={cursorTrail}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              {triggerMode === 'custom' && (
                <Button
                  onClick={() => explodeRef.current?.explode()}
                >
                  Fire!
                </Button>
              )}
            </div>
          </div>
        </TabItem>
        <TabItem value="code" label="Code">
          <CodeBlock language="tsx">{codeString}</CodeBlock>
        </TabItem>
      </Tabs>
    </div>
  );
};

export default ExplodingInputDemo;
