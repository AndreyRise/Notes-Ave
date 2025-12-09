import React, { useState, useEffect } from 'react';
import { SubTask, PriorityLevel, Task } from '../types';
import { Plus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface AddEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string, description: string, priority: PriorityLevel, reminder: string | undefined, subtasks: SubTask[]) => void;
    taskToEdit?: Task | null;
}

export const AddEditModal: React.FC<AddEditModalProps> = ({ isOpen, onClose, onSave, taskToEdit }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<PriorityLevel>(PriorityLevel.MEDIUM);
    const [reminder, setReminder] = useState('');
    const [subtasks, setSubtasks] = useState<SubTask[]>([]);
    
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            if (taskToEdit) {
                // Edit Mode: Populate fields
                setTitle(taskToEdit.title);
                setDescription(taskToEdit.description || '');
                setPriority(taskToEdit.priority);
                setReminder(taskToEdit.reminderTime || '');
                setSubtasks(taskToEdit.subTasks || []);
            } else {
                // Add Mode: Reset fields
                setTitle('');
                setDescription('');
                setPriority(PriorityLevel.MEDIUM);
                setReminder('');
                setSubtasks([]);
            }
        } else {
             // Wait for animation to finish before hiding from DOM
             const timer = setTimeout(() => {
                setIsVisible(false);
            }, 300); // Matches 0.3s animation duration
            return () => clearTimeout(timer);
        }
    }, [isOpen, taskToEdit]);

    const handleAddSubtask = () => {
        setSubtasks(prev => [...prev, {
            id: uuidv4(),
            title: '',
            isCompleted: false
        }]);
    };

    const handleRemoveSubtask = (id: string) => {
        setSubtasks(prev => prev.filter(st => st.id !== id));
    };

    const handleUpdateSubtask = (id: string, value: string) => {
        setSubtasks(prev => prev.map(st => st.id === id ? { ...st, title: value } : st));
    };

    const handleSave = () => {
        if (!title.trim()) return;
        onSave(title, description, priority, reminder || undefined, subtasks.filter(st => st.title.trim() !== ''));
        onClose();
    };

    if (!isVisible && !isOpen) return null;

    const modalAnimation = isOpen ? 'animate-slide-up' : 'animate-slide-down';
    const backdropAnimation = isOpen ? 'animate-fade-in' : 'animate-fade-out';

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-[2px] ${backdropAnimation}`}
                onClick={onClose}
            />
            
            {/* Modal Sheet */}
            <div className={`relative w-full bg-ios-sheet rounded-t-[20px] shadow-ios pb-safe-area overflow-hidden z-10 ${modalAnimation}`}>
                
                {/* Grabber */}
                <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                    <div className="w-10 h-1.5 bg-gray-500/40 rounded-full"></div>
                </div>

                {/* Header Actions */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-ios-separator/50 dark:border-none dark:bg-black transition-colors">
                    <button onClick={onClose} className="text-ios-blue text-[17px] hover:opacity-70">
                        Отмена
                    </button>
                    <span className="text-[17px] font-semibold text-ios-text">
                        {taskToEdit ? 'Редактирование' : 'Новая задача'}
                    </span>
                    <button 
                        onClick={handleSave} 
                        disabled={!title.trim()}
                        className={`text-[17px] font-bold transition-colors ${
                            title.trim() 
                            ? 'text-ios-blue dark:text-white' 
                            : 'text-ios-textSec/50 dark:text-gray-500'
                        }`}
                    >
                        Готово
                    </button>
                </div>

                <div className="p-4 space-y-6 max-h-[85vh] overflow-y-auto bg-ios-bg">
                    {/* Main Input Group */}
                    <div className="bg-ios-card rounded-xl overflow-hidden shadow-sm">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Название"
                            className="w-full bg-ios-card p-4 text-[17px] text-ios-text placeholder-ios-textSec focus:outline-none"
                            autoFocus={!taskToEdit} // Only autofocus on new tasks
                        />
                        <div className="h-[0.5px] bg-ios-separator mx-4"></div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Заметка"
                            rows={3}
                            className="w-full bg-ios-card p-4 text-[17px] text-ios-text placeholder-ios-textSec focus:outline-none resize-none"
                        />
                    </div>

                    {/* Options Group */}
                    <div className="bg-ios-card rounded-xl overflow-hidden shadow-sm">
                        {/* Date Picker row */}
                        <div className="flex items-center justify-between p-4 bg-ios-card active:bg-ios-cardHigh transition-colors">
                            <span className="text-[17px] text-ios-text">Напоминание</span>
                            <input 
                                type="datetime-local" 
                                value={reminder}
                                onChange={(e) => setReminder(e.target.value)}
                                className="bg-transparent text-ios-blue text-[17px] outline-none text-right"
                            />
                        </div>

                         <div className="h-[0.5px] bg-ios-separator mx-4"></div>

                        {/* Priority row */}
                        <div className="flex items-center justify-between p-4 bg-ios-card">
                             <span className="text-[17px] text-ios-text">Приоритет</span>
                             <div className="flex bg-ios-cardHigh rounded-lg p-0.5">
                                {[PriorityLevel.LOW, PriorityLevel.MEDIUM, PriorityLevel.HIGH].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPriority(p)}
                                        className={`
                                            px-3 py-1 text-[13px] rounded-md font-medium transition-all capitalize
                                            ${priority === p ? 'bg-white text-black shadow-sm dark:bg-[#636366] dark:text-white' : 'text-ios-textSec'}
                                        `}
                                    >
                                        {p === PriorityLevel.LOW ? 'Низ' : p === PriorityLevel.MEDIUM ? 'Сред' : 'Выс'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Subtasks Section */}
                    <div className="bg-ios-card rounded-xl overflow-hidden shadow-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                             <span className="text-[17px] text-ios-text">Подзадачи</span>
                        </div>
                        
                        <div className="space-y-0">
                            {subtasks.map((st) => (
                                <div key={st.id} className="flex items-center gap-2 py-2 border-b border-ios-separator/50 last:border-0">
                                     <div className={`w-4 h-4 rounded-full border ${st.isCompleted ? 'bg-ios-blue border-ios-blue' : 'border-ios-textSec'}`}></div>
                                     <input
                                        type="text"
                                        value={st.title}
                                        onChange={(e) => handleUpdateSubtask(st.id, e.target.value)}
                                        placeholder="Шаг..."
                                        className="flex-1 bg-transparent text-[15px] text-ios-text outline-none placeholder-ios-textSec/50"
                                     />
                                     <button 
                                        onClick={() => handleRemoveSubtask(st.id)}
                                        className="text-ios-textSec p-1 hover:text-ios-red transition-colors"
                                     >
                                        <X size={16} />
                                     </button>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={handleAddSubtask}
                            className="mt-3 flex items-center gap-2 text-ios-textSec hover:text-ios-blue transition-colors w-full"
                        >
                            <div className="w-5 h-5 rounded-full bg-ios-green flex items-center justify-center">
                                <Plus size={14} className="text-white" strokeWidth={3} />
                            </div>
                            <span className="text-[15px]">Добавить шаг</span>
                        </button>
                    </div>

                    {/* Spacer for bottom safe area */}
                    <div className="h-10"></div>
                </div>
            </div>
        </div>
    );
};