"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getHoliday } from '../utils/holidays';

interface CalendarProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    onClose: () => void;
}

export default function Calendar({ value, onChange, onClose }: CalendarProps) {
    const [viewDate, setViewDate] = useState(() => value ? new Date(value) : new Date());

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth(); // 0-11

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon...

    // Adjust for Monday start: Mon=0, Sun=6
    const startDay = (firstDay + 6) % 7;

    const handlePrev = () => setViewDate(new Date(year, month - 1, 1));
    const handleNext = () => setViewDate(new Date(year, month + 1, 1));

    const handleSelect = (day: number) => {
        // Safe standard local date string construction YYYY-MM-DD
        const d = new Date(year, month, day);
        const yyyy = d.getFullYear();
        const mm = (d.getMonth() + 1).toString().padStart(2, '0');
        const dd = d.getDate().toString().padStart(2, '0');
        onChange(`${yyyy}-${mm}-${dd}`);
        onClose();
    };

    const days = [];
    // Empty slots
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }
    // Days
    for (let i = 1; i <= daysInMonth; i++) {
        // Reconstruct date string for holiday check
        const d = new Date(year, month, i); // Local time
        const yyyy = d.getFullYear();
        const mm = (d.getMonth() + 1).toString().padStart(2, '0');
        const dd = d.getDate().toString().padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const holiday = getHoliday(dateStr);
        const isSelected = value === dateStr;

        // Simple "Today" check (ignoring time)
        const now = new Date();
        const isToday = now.getFullYear() === year && now.getMonth() === month && now.getDate() === i;

        let className = "w-full h-8 rounded flex items-center justify-center text-xs font-bold transition relative group ";
        if (isSelected) {
            className += "bg-green-600 text-white shadow-lg z-10";
        } else if (holiday) {
            // Yellow for holiday
            className += "bg-yellow-900/40 text-yellow-400 border border-yellow-600/50 hover:bg-yellow-900/60";
        } else {
            className += "hover:bg-zinc-700 text-gray-300";
        }

        if (isToday && !isSelected) className += " border border-blue-500";

        days.push(
            <button
                key={dateStr}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSelect(i); }}
                className={className}
            >
                {i}
                {/* Helper Tooltip on Hover */}
                {holiday && (
                    <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-yellow-900 text-yellow-200 text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none border border-yellow-700 z-50">
                        {holiday}
                    </span>
                )}
            </button>
        );
    }

    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-3 w-[260px] animate-in zoom-in-95 duration-200 select-none" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
                <button onClick={(e) => { e.preventDefault(); handlePrev() }} className="p-1 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition"><ChevronLeft size={16} /></button>
                <h3 className="font-bold text-white text-sm capitalize">
                    {viewDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={(e) => { e.preventDefault(); handleNext() }} className="p-1 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition"><ChevronRight size={16} /></button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1 border-b border-zinc-800 pb-1">
                {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => (
                    <div key={d} className="text-center text-[10px] text-gray-500 font-bold uppercase">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days}
            </div>
        </div>
    );
}
