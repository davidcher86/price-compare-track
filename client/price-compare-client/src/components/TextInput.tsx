import React from 'react';

interface TextInputProps {
    value?: string;
    label?: string;
    className?: string;
    placeholder?: string;
    onChange: (value: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ value, label, className, placeholder, onChange }) => {
    const handleChange = (event: any) => {
        onChange(event.target.value);
    };

    return (
        <div className={"w-full h-full p-0.5 mx-1 p-1" + className}>
            {label && <label className="text-sm font-medium theme-font">{label}</label>}
            <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="flex-1 outline-none text-lg w-full h-full" />
        </div>
    );
};

export default TextInput;