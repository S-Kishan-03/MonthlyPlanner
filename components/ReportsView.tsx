import React, { useMemo } from 'react';
import { Task } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CATEGORIES } from '../constants';

interface ReportsViewProps {
  tasks: Task[];
}

const COLORS = {
    Work: '#3b82f6', // blue-500
    Home: '#8b5cf6', // purple-500
    Life: '#14b8a6', // teal-500
};

export const ReportsView: React.FC<ReportsViewProps> = ({ tasks }) => {

  const { totalTasks, completedTasks, pieChartData, monthlyCompletionData } = useMemo(() => {
    const totalCompletions = tasks.reduce((sum, task) => sum + task.completedDates.length, 0);
    
    const categoryCompletions = { Work: 0, Home: 0, Life: 0 };
    const monthlyCompletionMap: { [day: number]: number } = {};

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    tasks.forEach(task => {
      task.completedDates.forEach(dateString => {
        categoryCompletions[task.category]++;
        
        const date = new Date(dateString);
        // The date from dateString is UTC, so we need to get UTC month and year to avoid timezone issues.
        if (date.getUTCMonth() === currentMonth && date.getUTCFullYear() === currentYear) {
          const day = date.getUTCDate();
          monthlyCompletionMap[day] = (monthlyCompletionMap[day] || 0) + 1;
        }
      });
    });

    const pieData = CATEGORIES.map(cat => ({
        name: cat,
        value: categoryCompletions[cat]
    })).filter(d => d.value > 0);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthlyData = Array.from({length: daysInMonth}, (_, i) => ({
        day: i + 1,
        tasks: monthlyCompletionMap[i + 1] || 0
    }));


    return {
      totalTasks: tasks.length,
      completedTasks: totalCompletions,
      pieChartData: pieData,
      monthlyCompletionData: monthlyData
    };
  }, [tasks]);
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
          <p className="label text-gray-800 dark:text-gray-200">{`${label} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };


  return (
    <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Productivity Reports</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Tasks</h3>
                <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">{totalTasks}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Completions</h3>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">{completedTasks}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Tasks Completed by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={110}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                 <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">This Month's Activity</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyCompletionData}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="day" tick={{ fill: '#9CA3AF' }} label={{ value: 'Day of Month', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }} />
                        <YAxis allowDecimals={false} tick={{ fill: '#9CA3AF' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(128, 128, 128, 0.1)'}} />
                        <Legend wrapperStyle={{ color: '#9CA3AF' }}/>
                        <Bar dataKey="tasks" name="Completed Tasks" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};