import React from 'react';

interface TextInputProps {
    value?: string;
    label?: string;
    placeholder?: string;
    onChange: (value: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ value, label, placeholder, onChange }) => {
    const handleChange = (event: any) => {
        onChange(event.target.value);
    };

    return (
        <div>
            {label && <label className="text-sm font-medium">{label}</label>}
            <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="flex-1 outline-none text-lg" />
        </div>
    );
};

export default TextInput;