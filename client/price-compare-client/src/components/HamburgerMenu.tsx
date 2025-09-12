import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface HamburgerMenuProps {
    className?: string;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                closeMenu();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className={`relative ${className}`} ref={menuRef}>
            {/* Hamburger Button */}
            <button
                onClick={toggleMenu}
                className="flex flex-col justify-center items-center w-8 h-8 space-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-200 rounded"
                aria-label="Menu"
            >
                <span
                    className={`block w-6 h-0.5 bg-indigo-600 transition-all duration-300 ease-in-out ${
                        isOpen ? 'rotate-45 translate-y-1.5' : ''
                    }`}
                />
                <span
                    className={`block w-6 h-0.5 bg-indigo-600 transition-all duration-300 ease-in-out ${
                        isOpen ? 'opacity-0' : ''
                    }`}
                />
                <span
                    className={`block w-6 h-0.5 bg-indigo-600 transition-all duration-300 ease-in-out ${
                        isOpen ? '-rotate-45 -translate-y-1.5' : ''
                    }`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                        <Link
                            to="/compare"
                            className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                            onClick={closeMenu}
                        >
                            Compare
                        </Link>
                        <Link
                            to="/track"
                            className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                            onClick={closeMenu}
                        >
                            Track
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};
