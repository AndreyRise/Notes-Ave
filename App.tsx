import React, { useState, useEffect, useMemo } from 'react';
import { TaskItem } from './components/TaskItem';
import { AddEditModal } from './components/AddEditModal';
import { SettingsModal } from './components/SettingsModal';
import { Alert } from './components/Alert';
import { Task, FilterType, PriorityLevel, SubTask } from './types';
import { Plus, Loader2, Settings } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

declare global {
    interface Window {
        Telegram?: {
            WebApp: {
                ready: () => void;
                expand: () => void;
                close: () => void;
                sendData: (data: string) => void;
                isVersionAtLeast: (version: string) => boolean;
                MainButton: any;
                BackButton: any;
                HapticFeedback: {
                    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
                    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
                    selectionChanged: () => void;
                };
                CloudStorage: {
                    setItem: (key: string, value: string, callback?: (error: Error | null, stored: boolean) => void) => void;
                    getItem: (key: string, callback: (error: Error | null, value: string) => void) => void;
                    removeItem: (key: string, callback?: (error: Error | null, stored: boolean) => void) => void;
                };
                showPopup: (params: {
                    title?: string;
                    message: string;
                    buttons?: { id?: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text?: string }[];
                }, callback?: (buttonId: string) => void) => void;
                setHeaderColor: (color: string) => void;
                setBackgroundColor: (color: string) => void;
                themeParams: {
                    bg_color?: string;
                    secondary_bg_color?: string;
                    text_color?: string;
                    button_color?: string;
                    button_text_color?: string;
                };
                initDataUnsafe?: {
                    user?: {
                        id: number;
                        first_name: string;
                        last_name?: string;
                        username?: string;
                        photo_url?: string;
                    }
                }
            };
        };
    }
}

const tg = window.Telegram?.WebApp;
const STORAGE_KEY = 'notesave_db_v1';
const THEME_KEY = 'notesave_theme_pref';
const isCloudStorageSupported = tg?.isVersionAtLeast ? tg.isVersionAtLeast('6.9') : false;

const App: React.FC = () => {
    const user = tg?.initDataUnsafe?.user;

    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('active');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showNotification, setShowNotification] = useState<string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        title: string;
        message?: string;
        buttons: { text: string; style?: 'default' | 'destructive' | 'cancel'; onPress: () => void }[];
    }>({ isOpen: false, title: '', buttons: [] });

    // Storage Adapter to handle Promise-based Cloud/Local switching
    const storage = useMemo(() => ({
        getItem: async (key: string): Promise<string | null> => {
            return new Promise((resolve) => {
                if (isCloudStorageSupported && tg?.CloudStorage) {
                    tg.CloudStorage.getItem(key, (error, value) => {
                        if (error) {
                            console.error(`[CloudStorage] Get Error for ${key}:`, error);
                            resolve(null);
                        } else {
                            resolve(value);
                        }
                    });
                } else {
                    resolve(localStorage.getItem(key));
                }
            });
        },
        setItem: async (key: string, value: string): Promise<boolean> => {
            return new Promise((resolve) => {
                if (isCloudStorageSupported && tg?.CloudStorage) {
                    tg.CloudStorage.setItem(key, value, (error, stored) => {
                        if (error) {
                            console.error(`[CloudStorage] Set Error for ${key}:`, error);
                            resolve(false);
                        } else {
                            resolve(stored);
                        }
                    });
                } else {
                    try {
                        localStorage.setItem(key, value);
                        resolve(true);
                    } catch (e) {
                        console.error("LocalStorage Error", e);
                        resolve(false);
                    }
                }
            });
        }
    }), []);

    // Initialization: Load Data & Theme
    useEffect(() => {
        if (tg) {
            tg.ready();
            tg.expand();
        }

        const initApp = async () => {
            try {
                // Load Tasks and Theme in parallel
                const [savedTasksJson, savedTheme] = await Promise.all([
                    storage.getItem(STORAGE_KEY),
                    storage.getItem(THEME_KEY)
                ]);

                if (savedTasksJson) {
                    try {
                        const parsed = JSON.parse(savedTasksJson);
                        if (Array.isArray(parsed)) setTasks(parsed);
                    } catch (e) {
                        console.error("JSON Parse Error", e);
                    }
                }

                if (savedTheme === 'light' || savedTheme === 'dark') {
                    setTheme(savedTheme);
                }
            } catch (error) {
                console.error("Initialization error", error);
            } finally {
                setIsLoading(false);
            }
        };

        initApp();
    }, [storage]);

    // Save Tasks
    useEffect(() => {
        if (isLoading) return;
        
        const saveTasks = async () => {
            const dataToSave = JSON.stringify(tasks);
            const success = await storage.setItem(STORAGE_KEY, dataToSave);
            if (!success && isCloudStorageSupported) {
                // Optional: Notify user if quota exceeded (CloudStorage limit is 4096 chars per key)
                console.warn("Failed to save to CloudStorage. Limit might be exceeded.");
            }
        };
        
        // Simple debounce could be added here if needed, but for now we save on change
        saveTasks();
    }, [tasks, isLoading, storage]);

    // Save & Apply Theme
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            if (tg) {
                tg.setHeaderColor('#000000');
                tg.setBackgroundColor('#000000');
            }
        } else {
            document.documentElement.classList.remove('dark');
            if (tg) {
                tg.setHeaderColor('#F2F2F7');
                tg.setBackgroundColor('#F2F2F7');
            }
        }

        if (!isLoading) {
            storage.setItem(THEME_KEY, theme);
        }
    }, [theme, isLoading, storage]);

    const stats = useMemo(() => {
        const total = tasks.length;
        const active = tasks.filter(t => !t.isCompleted).length;
        const completed = tasks.filter(t => t.isCompleted).length;
        return { total, active, completed };
    }, [tasks]);

    const triggerHaptic = (type: 'success' | 'light' | 'medium') => {
        if (!tg) return;
        if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
        else tg.HapticFeedback.impactOccurred(type);
    };

    const showToast = (msg: string) => {
        setShowNotification(msg);
        setTimeout(() => setShowNotification(null), 3000);
    };

    const handleSaveTask = (
        title: string, 
        description: string, 
        priority: PriorityLevel, 
        reminder: string | undefined, 
        subtasks: SubTask[]
    ) => {
        if (editingTask) {
            // Update existing task
            setTasks(prev => prev.map(t => {
                if (t.id === editingTask.id) {
                    return {
                        ...t,
                        title,
                        description,
                        priority,
                        reminderTime: reminder,
                        subTasks: subtasks,
                    };
                }
                return t;
            }));
            triggerHaptic('success');
            showToast("Задача обновлена");
        } else {
            // Create new task
            const newTask: Task = {
                id: uuidv4(),
                title,
                description,
                priority,
                reminderTime: reminder,
                subTasks: subtasks,
                isCompleted: false,
                createdAt: Date.now(),
            };
            setTasks(prev => [newTask, ...prev]);
            triggerHaptic('success');
            if (reminder) showToast("Напоминание установлено");
        }
        setEditingTask(null); // Reset editing state
    };

    const handleOpenAddModal = () => {
        triggerHaptic('light');
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        triggerHaptic('light');
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleToggleTask = (id: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id === id) {
                const newState = !t.isCompleted;
                if (newState) triggerHaptic('success');
                else triggerHaptic('light');
                return { ...t, isCompleted: newState };
            }
            return t;
        }));
    };

    const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));

    const handleDeleteTask = (id: string) => {
        triggerHaptic('medium');
        setAlertConfig({
            isOpen: true,
            title: 'Удалить задачу?',
            message: 'Это действие нельзя отменить.',
            buttons: [
                { text: 'Отмена', style: 'cancel', onPress: closeAlert },
                { 
                    text: 'Удалить', 
                    style: 'destructive', 
                    onPress: () => {
                        setTasks(prev => prev.filter(t => t.id !== id));
                        triggerHaptic('success');
                        closeAlert();
                    } 
                }
            ]
        });
    };

    const handleDeleteAll = () => {
        triggerHaptic('medium');
        setAlertConfig({
            isOpen: true,
            title: 'Удалить все задачи?',
            message: 'Это действие удалит все ваши задачи. Отменить его невозможно.',
            buttons: [
                { text: 'Отмена', style: 'cancel', onPress: closeAlert },
                { 
                    text: 'Удалить все', 
                    style: 'destructive', 
                    onPress: () => {
                        setTasks([]);
                        setIsSettingsOpen(false);
                        triggerHaptic('success');
                        showToast('Все задачи удалены');
                        closeAlert();
                    } 
                }
            ]
        });
    };

    const handleToggleSubTask = (taskId: string, subTaskId: string) => {
        triggerHaptic('light');
        setTasks(prev => prev.map(t => {
            if (t.id !== taskId) return t;
            return {
                ...t,
                subTasks: t.subTasks.map(st => 
                    st.id === subTaskId ? { ...st, isCompleted: !st.isCompleted } : st
                )
            };
        }));
    };

    const filteredTasks = tasks.filter(t => {
        if (filter === 'active') return !t.isCompleted;
        if (filter === 'completed') return t.isCompleted;
        return true;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-ios-bg text-ios-textSec">
                <Loader2 size={32} className="animate-spin text-ios-blue" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ios-bg pb-24 text-ios-text font-sans antialiased selection:bg-ios-blue/30 transition-colors duration-300">
            {/* iOS Style Large Header */}
            <header className="pt-8 pb-2 px-5 bg-ios-bg sticky top-0 z-30 transition-colors duration-300">
                <div className="flex justify-between items-end mb-4">
                    {/* Left: Title */}
                    <div>
                        <h1 className="text-[34px] font-bold leading-tight tracking-tight text-ios-text">
                            Мои задачи
                        </h1>
                        <p className="text-[15px] font-medium text-ios-textSec mt-1">
                            {user?.first_name || 'Notes Ave'} • {stats.active} осталось
                        </p>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 mb-2">
                         <button
                            onClick={() => {
                                triggerHaptic('light');
                                setIsSettingsOpen(true);
                            }}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-ios-text active:opacity-50 transition-opacity"
                         >
                            <Settings size={24} strokeWidth={2} />
                         </button>
                        
                        {user?.photo_url && (
                            <img 
                                src={user.photo_url} 
                                alt="Profile" 
                                className="w-9 h-9 rounded-full bg-ios-cardHigh object-cover"
                            />
                        )}
                    </div>
                </div>

                {/* iOS Segmented Control */}
                <div className="bg-ios-cardHigh/50 p-0.5 rounded-lg flex relative backdrop-blur-sm">
                    <button 
                        onClick={() => {
                            triggerHaptic('light');
                            setFilter('active');
                        }}
                        className={`
                            flex-1 py-1.5 text-[13px] font-medium rounded-[6px] transition-all duration-200 z-10
                            ${filter === 'active' ? 'bg-ios-card text-ios-text shadow-sm' : 'text-ios-textSec'}
                        `}
                    >
                        Активные
                    </button>
                    <button 
                         onClick={() => {
                            triggerHaptic('light');
                            setFilter('completed');
                        }}
                        className={`
                            flex-1 py-1.5 text-[13px] font-medium rounded-[6px] transition-all duration-200 z-10
                            ${filter === 'completed' ? 'bg-ios-card text-ios-text shadow-sm' : 'text-ios-textSec'}
                        `}
                    >
                        Завершенные
                    </button>
                </div>
            </header>

            {/* Task List - Inset Grouped Style */}
            <main className="px-4 mt-2">
                {filteredTasks.length === 0 ? (
                    <div className="py-20 text-center text-ios-textSec">
                        <p className="text-[17px]">
                            {filter === 'active' 
                                ? 'Нет активных задач' 
                                : 'Список завершенных пуст'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-ios-card rounded-xl overflow-hidden shadow-sm transition-colors duration-300">
                        {filteredTasks.map((task, index) => (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                isLast={index === filteredTasks.length - 1}
                                onToggle={handleToggleTask}
                                onDelete={handleDeleteTask}
                                onEdit={handleEditTask}
                                onToggleSubTask={handleToggleSubTask}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Floating Action Button */}
            <button
                onClick={handleOpenAddModal}
                className="fixed bottom-8 right-6 w-14 h-14 bg-ios-blue rounded-full shadow-ios flex items-center justify-center text-white active:scale-90 active:opacity-80 transition-all z-40"
            >
                <Plus size={30} strokeWidth={2.5} />
            </button>

            <AddEditModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTask}
                taskToEdit={editingTask}
                onError={(msg) => showToast(msg)}
            />

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentTheme={theme}
                onThemeChange={setTheme}
                onDeleteAll={handleDeleteAll}
            />
            
            <Alert
                isOpen={alertConfig.isOpen}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={closeAlert}
            />

            {/* Simple Toast */}
            {showNotification && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#333333]/90 backdrop-blur-md text-white px-5 py-3 rounded-full text-[15px] font-medium shadow-ios animate-fade-in z-50">
                    {showNotification}
                </div>
            )}
        </div>
    );
};

export default App;