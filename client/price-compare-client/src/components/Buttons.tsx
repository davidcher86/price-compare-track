import React from 'react';

interface SimpleButtonProps {
    label?: string;
    additionalClasses?: string;
    onClick?: () => void;
}

export const SimpleButton: React.FC<SimpleButtonProps> = ({ label, onClick, additionalClasses }) => {
    const handleOnClick = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <button
            onClick={handleOnClick}
            className={`px-6 py-3 rounded-2xl border-2 border-indigo-500 text-indigo-500 
                       font-semibold hover:bg-indigo-500 hover:text-white 
                       focus:ring-4 focus:ring-indigo-200 transition-all duration-200 ${additionalClasses || ''}`}>
                {label || ''}
        </button>
    );
};

interface ImgButtonProps extends SimpleButtonProps {
    image?: string;
}

export const ImgButton: React.FC<ImgButtonProps> = ({ label, onClick, additionalClasses, image }) => {
    const handleOnClick = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <button
            onClick={handleOnClick}
            className={`px-6 py-3 rounded-2xl border-2 border-indigo-500 text-indigo-500 
                       font-semibold hover:bg-indigo-500 hover:text-white 
                       focus:ring-4 focus:ring-indigo-200 transition-all duration-200 ${additionalClasses || ''}`}>
                {image && <img src={image} alt={label} className="inline-block mr-2" />}
                {label || ''}
        </button>
    );
};