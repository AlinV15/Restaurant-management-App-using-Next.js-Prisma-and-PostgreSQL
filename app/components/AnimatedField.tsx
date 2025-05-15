
import React from 'react';

interface AnimatedFieldProps {
  id: string;
  label: string;
  value: string | number;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
}

const AnimatedField: React.FC<AnimatedFieldProps> = ({
  id,
  label,
  value,
  type = 'text',
  onChange,
  min
}) => {
  return (
    <div className="relative w-full">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        className="peer w-full border border-gray-300 px-3 pt-5 pb-2 rounded focus:outline-none focus:border-black transition-all"
        placeholder=" "
      />
      <label
        htmlFor={id}
        className="absolute left-3 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-black"
      >
        {label}
      </label>
    </div>
  );
};

export default AnimatedField;
