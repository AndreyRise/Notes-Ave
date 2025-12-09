import React, { useState, useEffect } from 'react';

interface AlertButton {
    text: string;
    style?: 'default' | 'destructive' | 'cancel';
    onPress: () => void;
}

interface AlertProps {
    isOpen: boolean;
    title: string;
    message?: string;
    buttons: AlertButton[];
    onClose: () => void; // Called when clicking backdrop
}

export const Alert: React.FC<AlertProps> = ({ isOpen, title, message, buttons, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            // Wait for animation to finish before hiding from DOM
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 300); // Matches 0.3s animation duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    const modalAnimation = isOpen ? 'animate-slide-up' : 'animate-slide-down';
    const backdropAnimation = isOpen ? 'animate-fade-in' : 'animate-fade-out';

    return (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] ${backdropAnimation}`}
                onClick={onClose}
            />

            {/* Modal Sheet */}
            <div className={`relative w-full bg-ios-bg rounded-t-[20px] shadow-ios pb-safe-area overflow-hidden z-10 ${modalAnimation}`}>
                
                {/* Grabber */}
                <div className="w-full flex justify-center pt-3 pb-2" onClick={onClose}>
                    <div className="w-10 h-1.5 bg-gray-500/40 rounded-full"></div>
                </div>

                <div className="px-4 pb-6 pt-2">
                    {/* Header */}
                    <div className="text-center mb-6 px-4">
                        <h3 className="text-[20px] font-semibold text-ios-text mb-1.5 leading-tight">
                            {title}
                        </h3>
                        {message && (
                            <p className="text-[13px] text-ios-textSec leading-snug">
                                {message}
                            </p>
                        )}
                    </div>

                    {/* Buttons Stack */}
                    <div className="space-y-3">
                        {buttons.map((btn, index) => (
                            <button
                                key={index}
                                onClick={btn.onPress}
                                className={`
                                    w-full py-3.5 px-4 rounded-xl text-[17px] font-medium shadow-sm transition-transform active:scale-[0.98] flex items-center justify-center
                                    ${btn.style === 'destructive' 
                                        ? 'bg-ios-card text-ios-red' 
                                        : btn.style === 'cancel'
                                            ? 'bg-ios-card text-ios-blue font-semibold'
                                            : 'bg-ios-card text-ios-blue'
                                    }
                                `}
                            >
                                {btn.text}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};