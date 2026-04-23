import { useState, ReactElement } from 'react';
import { AnimatedInput } from '@site/src/components/UI/input';

type InputValues = {
  borderBeam: string;
  neon: string;
  particles: string;
  cosmic: string;
};

export function InputBasicDemo(): ReactElement {
  const [value, setValue] = useState<string>('');

  return (
    <div className="pt-10 pb-4">
      <AnimatedInput
        placeholder="Type something..."
        variant="clean"
        value={value}
        onChange={setValue}
      />
    </div>
  );
}

export function InputAdvancedDemo(): ReactElement {
  const [values, setValues] = useState<InputValues>({
    borderBeam: '',
    neon: '',
    particles: '',
    cosmic: ''
  });

  const handleChange = (key: keyof InputValues) => (value: string): void => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="pt-10 pb-4 flex flex-col gap-4">
      <AnimatedInput
        placeholder="Border Beam"
        variant="borderBeam"
        value={values.borderBeam}
        onChange={handleChange('borderBeam')}
      />
      <AnimatedInput
        placeholder="Neon Effect"
        variant="neon"
        value={values.neon}
        onChange={handleChange('neon')}
      />
      <AnimatedInput
        placeholder="Particles"
        variant="particles"
        value={values.particles}
        onChange={handleChange('particles')}
      />
      <AnimatedInput
        placeholder="Cosmic"
        variant="cosmic"
        value={values.cosmic}
        onChange={handleChange('cosmic')}
      />
    </div>
  );
}
