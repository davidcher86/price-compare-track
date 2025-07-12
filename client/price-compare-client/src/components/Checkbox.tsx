import React from 'react';

interface CheckboxProps {
    label?: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    nameId?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ nameId, label, checked = false, onChange }) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(event.target.checked);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <input
                id={`checkbox-${nameId}`}
                type="checkbox"
                checked={checked}
                onChange={handleChange}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            {label && <label className="text-sm font-medium">{label}</label>}
        </div>
    );
};

export default Checkbox;