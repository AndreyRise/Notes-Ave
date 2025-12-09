import React, { useState, useEffect } from 'react';
import { Moon, Sun, Trash2, ChevronRight, X } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: 'light' | 'dark';
    onThemeChange: (theme: 'light' | 'dark') => void;
    onDeleteAll: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    currentTheme, 
    onThemeChange, 
    onDeleteAll 
}) => {
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
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-[4px] ${backdropAnimation}`}
                onClick={onClose}
            />
            
            {/* Modal Sheet */}
            <div className={`relative w-full bg-ios-bg rounded-t-[20px] shadow-ios pb-safe-area overflow-hidden z-10 ${modalAnimation}`}>
                
                {/* Grabber */}
                <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                    {/* Used standard tailwind color for guaranteed opacity support */}
                    <div className="w-10 h-1.5 bg-gray-500/40 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="flex justify-between items-center px-5 pt-2 pb-2 bg-ios-bg">
                    <span className="text-[22px] font-bold text-ios-text tracking-tight">Настройки</span>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 bg-ios-cardHigh/50 rounded-full flex items-center justify-center text-ios-textSec hover:text-ios-text transition-colors"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="p-5 space-y-8 bg-ios-bg min-h-[40vh]">
                    
                    {/* Theme Section */}
                    <div>
                        <h3 className="text-[13px] uppercase tracking-wide font-semibold text-ios-textSec mb-3 pl-1">Оформление</h3>
                        <div className="bg-ios-cardHigh rounded-lg p-0.5 flex relative">
                            <button
                                onClick={() => onThemeChange('light')}
                                className={`
                                    flex-1 flex items-center justify-center gap-2 py-1.5 rounded-[7px] text-[15px] font-medium transition-all 
                                    ${currentTheme === 'light' 
                                        ? 'bg-ios-card text-ios-text shadow-sm' 
                                        : 'text-ios-textSec'}
                                `}
                            >
                                <Sun size={18} /> Светлая
                            </button>
                            <button
                                onClick={() => onThemeChange('dark')}
                                className={`
                                    flex-1 flex items-center justify-center gap-2 py-1.5 rounded-[7px] text-[15px] font-medium transition-all 
                                    ${currentTheme === 'dark' 
                                        ? 'bg-[#636366] text-white shadow-sm' 
                                        : 'text-ios-textSec'}
                                `}
                            >
                                <Moon size={18} /> Темная
                            </button>
                        </div>
                    </div>

                    {/* Data Section */}
                    <div>
                        <h3 className="text-[13px] uppercase tracking-wide font-semibold text-ios-textSec mb-3 pl-1">Данные</h3>
                        <div className="bg-ios-card rounded-xl overflow-hidden">
                            <button 
                                onClick={onDeleteAll}
                                className="w-full flex items-center justify-between p-4 active:bg-ios-cardHigh transition-colors"
                            >
                                <span className="text-[17px] font-medium text-ios-red flex items-center gap-3">
                                    <Trash2 size={20} />
                                    Удалить все задачи
                                </span>
                                <ChevronRight size={20} className="text-ios-textSec/40" />
                            </button>
                        </div>
                        <p className="text-[13px] text-ios-textSec mt-3 pl-1 leading-relaxed opacity-60">
                            Это действие безвозвратно удалит все ваши текущие и завершенные задачи.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 text-center opacity-40">
                        <p className="text-[12px] text-ios-textSec font-medium">Notes Ave v1.2</p>
                    </div>
                </div>
            </div>
        </div>
    );
};