import React, { useState } from 'react';
import { Task, PriorityLevel } from '../types';
import { Check, Trash2, Clock, AlertCircle, Pencil } from 'lucide-react';

interface TaskItemProps {
    task: Task;
    isLast: boolean;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (task: Task) => void;
    onToggleSubTask: (taskId: string, subTaskId: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, isLast, onToggle, onDelete, onEdit, onToggleSubTask }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Format date nicely
    const formatDate = (isoString?: string) => {
        if (!isoString) return null;
        const date = new Date(isoString);
        return date.toLocaleString('ru-RU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const totalSubtasks = task.subTasks.length;
    const completedSubtasks = task.subTasks.filter(st => st.isCompleted).length;

    return (
        <div className="group bg-ios-card active:bg-ios-cardHigh transition-colors duration-200">
            <div className="flex items-start pl-4 py-3">
                {/* iOS Style Circle Checkbox */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle(task.id);
                    }}
                    className={`
                        mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300
                        ${task.isCompleted 
                            ? 'bg-ios-blue border-ios-blue' 
                            : 'border-ios-textSec hover:border-ios-blue'}
                    `}
                >
                    {task.isCompleted && <Check size={14} className="text-white stroke-[3]" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0 ml-3 pr-4">
                    <div 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="cursor-pointer"
                    >
                        <div className="flex justify-between items-start">
                            <h3 className={`text-[17px] leading-snug font-normal transition-colors ${task.isCompleted ? 'text-ios-textSec line-through' : 'text-ios-text'}`}>
                                {task.title}
                            </h3>
                        </div>

                        {task.description && (
                            <p className="text-[15px] text-ios-textSec mt-0.5 leading-snug truncate">{task.description}</p>
                        )}

                        <div className="flex items-center gap-3 mt-1.5">
                            {task.reminderTime && (
                                <span className={`flex items-center gap-1 text-[13px] ${new Date(task.reminderTime) < new Date() ? 'text-ios-red' : 'text-ios-textSec'}`}>
                                    <Clock size={13} />
                                    {formatDate(task.reminderTime)}
                                </span>
                            )}
                            
                            {task.priority === PriorityLevel.HIGH && !task.isCompleted && (
                                <span className="text-ios-blue text-[13px] font-medium flex items-center gap-1">
                                    <AlertCircle size={13}/> Важно
                                </span>
                            )}

                            {totalSubtasks > 0 && (
                                <span className="text-[13px] text-ios-textSec">
                                    {completedSubtasks}/{totalSubtasks}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                        <div className="mt-3 animate-fade-in">
                            {/* Subtasks */}
                            {task.subTasks.length > 0 && (
                                <div className="space-y-3 pb-3">
                                    {task.subTasks.map(sub => (
                                        <div 
                                            key={sub.id} 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleSubTask(task.id, sub.id);
                                            }}
                                            className="flex items-start gap-3 pl-1 cursor-pointer"
                                        >
                                            <div className={`
                                                mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center transition-colors
                                                ${sub.isCompleted ? 'bg-ios-textSec border-ios-textSec' : 'border-ios-textSec'}
                                            `}>
                                                {sub.isCompleted && <Check size={10} className="text-black" />}
                                            </div>
                                            <span className={`text-[15px] leading-snug ${sub.isCompleted ? 'line-through text-ios-textSec' : 'text-ios-text'}`}>
                                                {sub.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Action Buttons Row */}
                            <div className="flex items-center gap-3 pt-3 border-t border-ios-separator/50 mt-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(task);
                                    }}
                                    className="flex-1 bg-ios-cardHigh py-2 rounded-lg text-[15px] font-medium text-ios-text flex items-center justify-center gap-2 active:bg-ios-cardHigh/80"
                                >
                                    <Pencil size={16} /> Редактировать
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(task.id);
                                    }}
                                    className="flex-1 bg-ios-red/10 py-2 rounded-lg text-[15px] font-medium text-ios-red flex items-center justify-center gap-2 active:bg-ios-red/20"
                                >
                                    <Trash2 size={16} /> Удалить
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Separator Line (only if not last) */}
            {!isLast && (
                <div className="h-[0.5px] bg-ios-separator ml-14"></div>
            )}
        </div>
    );
};