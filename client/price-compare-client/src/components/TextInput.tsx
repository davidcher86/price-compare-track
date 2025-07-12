import React, { useState } from 'react';

interface TextInputProps {
    label?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ label, placeholder, onChange }) => {
    const [value, setValue] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {label && <label className="text-sm font-medium">{label}</label>}
            <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
};

export default TextInput;