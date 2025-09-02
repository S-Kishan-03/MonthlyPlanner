import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { TaskItem } from './TaskItem';

interface DailyViewProps {
  tasks: Task[];
  onCompleteTask: (taskId: string, date: Date) => void;
  onDeleteTask: (taskId:string) => void;
  onEditTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
}

type PositionedTask = Task & {
    startMinutes: number;
    endMinutes: number;
    top: number;
    height: number;
    colIndex?: number;
    width?: number;
    left?: number;
};

const HOUR_HEIGHT_PX = 80; // The height of one hour slot in pixels

// Helper function to determine if a task should appear on a given date
const isTaskOnDate = (task: Task, date: Date): boolean => {
  const taskDate = new Date(task.dueDate);
  const checkDate = new Date(date);

  // Normalize dates to midnight to compare days only
  taskDate.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);

  if (taskDate > checkDate) {
    return false; // Task starts in the future
  }

  switch (task.repeat) {
    case 'none':
      return taskDate.getTime() === checkDate.getTime();
    case 'daily':
      return true;
    case 'weekly':
      return taskDate.getDay() === checkDate.getDay();
    case 'monthly':
      return taskDate.getDate() === checkDate.getDate();
    default:
      return false;
  }
};


export const DailyView: React.FC<DailyViewProps> = ({ tasks, onCompleteTask, onDeleteTask, onEditTask, onUpdateTask }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const [draggedTaskInfo, setDraggedTaskInfo] = useState<{
        task: PositionedTask;
        newTop: number;
        originalTop: number;
    } | null>(null);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [year, month, day] = e.target.value.split('-').map(Number);
        const newDate = new Date(year, month - 1, day);
        // Adjust for timezone offset to prevent date from changing
        const tzOffset = newDate.getTimezoneOffset() * 60000;
        setCurrentDate(new Date(newDate.getTime() - tzOffset));
    };
    
    const handleSetToday = () => {
        setCurrentDate(new Date());
    };

    const dailyTasks = useMemo(() => {
        return tasks
            .filter(task => isTaskOnDate(task, currentDate))
            .map(task => {
                // Adjust the dueDate of the task instance to the currentDate for correct positioning and display
                const originalTime = new Date(task.dueDate);
                const occurrenceDueDate = new Date(currentDate);
                occurrenceDueDate.setHours(
                    originalTime.getHours(),
                    originalTime.getMinutes(),
                    originalTime.getSeconds(),
                    originalTime.getMilliseconds()
                );
                return {
                    ...task,
                    dueDate: occurrenceDueDate.toISOString(),
                };
            });
    }, [tasks, currentDate]);

    const positionedTasks = useMemo<PositionedTask[]>(() => {
        if (dailyTasks.length === 0) return [];
        
        // Fix: Explicitly type `tasksWithTime` as `PositionedTask[]` to resolve errors where properties `colIndex`, `width`, and `left` were not found. This informs TypeScript that these optional properties can be added later.
        const tasksWithTime: PositionedTask[] = dailyTasks.map(task => {
            const startDate = new Date(task.dueDate);
            const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
            return {
                ...task,
                startMinutes,
                endMinutes: startMinutes + task.duration,
                top: (startMinutes / 60) * HOUR_HEIGHT_PX,
                height: (task.duration / 60) * HOUR_HEIGHT_PX,
            };
        }).sort((a,b) => a.startMinutes - b.startMinutes || b.duration - a.duration);
        
        const findCollisionGroups = (tasks: PositionedTask[]) => {
             const adj = new Map();
             tasks.forEach(t1 => {
                 adj.set(t1.id, []);
                 tasks.forEach(t2 => {
                     if (t1.id !== t2.id && (t1.startMinutes < t2.endMinutes && t1.endMinutes > t2.startMinutes)) {
                         adj.get(t1.id).push(t2.id);
                     }
                 });
             });
             const visited = new Set();
             const groups: string[][] = [];
             tasks.forEach(task => {
                 if (!visited.has(task.id)) {
                     const group: string[] = [];
                     const stack = [task.id];
                     visited.add(task.id);
                     while (stack.length > 0) {
                         const u = stack.pop()!;
                         group.push(u);
                         adj.get(u).forEach((v: string) => {
                             if (!visited.has(v)) {
                                 visited.add(v);
                                 stack.push(v);
                             }
                         });
                     }
                     groups.push(group);
                 }
             });
             return groups;
        };

        const taskMap = new Map(tasksWithTime.map(t => [t.id, t]));
        const collisionGroups = findCollisionGroups(tasksWithTime);
        
        let finalLayoutTasks: PositionedTask[] = [];

        collisionGroups.forEach(groupIds => {
            const groupTasks = groupIds.map(id => taskMap.get(id)!);
            groupTasks.sort((a,b) => a.startMinutes - b.startMinutes);

            const columns: PositionedTask[][] = [];
            groupTasks.forEach(task => {
                let placed = false;
                for (let i = 0; i < columns.length; i++) {
                    const lastTaskInCol = columns[i][columns[i].length - 1];
                    if (lastTaskInCol.endMinutes <= task.startMinutes) {
                        columns[i].push(task);
                        task.colIndex = i;
                        placed = true;
                        break;
                    }
                }
                if (!placed) {
                    columns.push([task]);
                    task.colIndex = columns.length - 1;
                }
            });

            const numColumns = columns.length;
            groupTasks.forEach(task => {
                task.width = 100 / numColumns;
                task.left = task.colIndex! * task.width;
            });

            finalLayoutTasks.push(...groupTasks);
        });

        // Add non-colliding tasks
        const collidingIds = new Set(finalLayoutTasks.map(t => t.id));
        tasksWithTime.forEach(task => {
            if (!collidingIds.has(task.id)) {
                task.width = 100;
                task.left = 0;
                finalLayoutTasks.push(task);
            }
        });


        return finalLayoutTasks.sort((a, b) => a.top - b.top);

    }, [dailyTasks]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, task: PositionedTask) => {
        e.preventDefault();
        e.stopPropagation();

        document.body.style.cursor = 'grabbing';

        setDraggedTaskInfo({
            task,
            newTop: task.top,
            originalTop: task.top,
        });

        const initialY = e.clientY;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaY = moveEvent.clientY - initialY;
            let newTop = task.top + deltaY;

            const maxTop = 24 * HOUR_HEIGHT_PX - task.height;
            newTop = Math.max(0, Math.min(newTop, maxTop));
            
            const snapIncrement = (15 / 60) * HOUR_HEIGHT_PX;
            newTop = Math.round(newTop / snapIncrement) * snapIncrement;

            setDraggedTaskInfo(prev => prev ? { ...prev, newTop } : null);
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            
            setDraggedTaskInfo(prev => {
                if (!prev) return null;
                
                const finalTop = prev.newTop;

                if (finalTop !== prev.originalTop) {
                    const totalMinutes = (finalTop / HOUR_HEIGHT_PX) * 60;
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = Math.round(totalMinutes % 60);

                    const originalDueDate = new Date(prev.task.dueDate);
                    const newDueDate = new Date(
                        originalDueDate.getFullYear(),
                        originalDueDate.getMonth(),
                        originalDueDate.getDate(),
                        hours,
                        minutes
                    );
                    
                    // For recurring tasks, we update the original task's time.
                    // The date part is preserved from the original task to maintain the recurring anchor.
                    const originalTask = tasks.find(t => t.id === prev.task.id);
                    if (originalTask) {
                        const finalNewDueDate = new Date(originalTask.dueDate);
                        finalNewDueDate.setHours(hours, minutes);

                         const updatedTask: Task = {
                            ...originalTask,
                            dueDate: finalNewDueDate.toISOString(),
                        };
                         onUpdateTask(updatedTask);
                    }
                }
                
                return null;
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const formatTimeFromTop = (top: number) => {
        const totalMinutes = (top / HOUR_HEIGHT_PX) * 60;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        const d = new Date();
        d.setHours(hours, minutes);
        return d.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', hour12: false });
    };

    const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23
    const listTasks = useMemo(() => {
        return dailyTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [dailyTasks]);


    return (
        <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Daily Timeline for {currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                <div className="flex items-center gap-2">
                    <input 
                        type="date" 
                        value={currentDate.toISOString().split('T')[0]} 
                        onChange={handleDateChange}
                        className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark]"
                    />
                    <button onClick={handleSetToday} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">Today</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm overflow-x-auto">
                    <div className="relative" style={{ height: `${24 * HOUR_HEIGHT_PX}px` }}>
                        {hours.map(hour => (
                             <div key={hour} className="relative flex" style={{ height: `${HOUR_HEIGHT_PX}px`}}>
                                <div className="w-12 sm:w-14 flex-shrink-0 text-right pr-2 -translate-y-1/2">
                                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{`${hour.toString().padStart(2, '0')}:00`}</span>
                                </div>
                                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                            </div>
                        ))}
                        {positionedTasks.map(task => {
                            const isDragging = draggedTaskInfo?.task.id === task.id;
                            const isCompleted = task.completedDates.includes(currentDate.toISOString().split('T')[0]);
                            const currentTop = isDragging ? draggedTaskInfo.newTop : task.top;
                            
                            return (
                                <div
                                    key={`${task.id}-${task.dueDate}`}
                                    onMouseDown={(e) => !isCompleted && handleMouseDown(e, task)}
                                    className={`absolute p-2 rounded-lg border-l-4 overflow-hidden transition-shadow ${isCompleted ? 'opacity-60 cursor-default' : 'cursor-grab'} ${isDragging ? 'shadow-2xl z-10' : 'shadow-sm'}`}
                                    style={{
                                        top: `${currentTop}px`,
                                        height: `${Math.max(task.height, 20)}px`,
                                        left: `calc(${task.left}% + 3.5rem)`,
                                        width: `calc(${task.width}% - 1rem)`,
                                        backgroundColor: CATEGORY_COLORS[task.category].split(' ')[0].replace('bg-', 'bg-opacity-20 bg-'),
                                        borderColor: CATEGORY_COLORS[task.category].split(' ')[0].replace('100', '500'),
                                    }}
                                >
                                    <p className={`font-bold text-xs truncate ${isCompleted ? 'line-through' : ''} ${CATEGORY_COLORS[task.category].split(' ')[1]}`}>{task.title}</p>
                                    <p className={`text-xs opacity-80 ${CATEGORY_COLORS[task.category].split(' ')[1]}`}>{`${new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', hour12: false })} (${task.duration} min)`}</p>
                                    {isDragging && (
                                        <div className="absolute -right-24 top-0 bg-indigo-600 text-white text-xs font-bold py-1 px-2 rounded shadow-lg">
                                            {formatTimeFromTop(draggedTaskInfo.newTop)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Task List</h3>
                     <div className="space-y-3">
                        {listTasks.length > 0 ? (
                            listTasks.map(task => (
                                <TaskItem key={`${task.id}-${task.dueDate}`} task={task} onComplete={onCompleteTask} onDelete={onDeleteTask} onEdit={onEditTask} displayDate={currentDate} />
                            ))
                        ) : (
                             <div className="text-center py-10 px-6 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400">No tasks for this day.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
