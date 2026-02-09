'use client'

import { useRef } from 'react'
import { PlusCircle } from 'lucide-react'
import { addTimeEntry } from '@/app/actions'

export default function TimeEntryForm() {
    const formRef = useRef<HTMLFormElement>(null)

    async function clientAction(formData: FormData) {
        await addTimeEntry(formData)
        formRef.current?.reset()
    }

    return (
        <form
            ref={formRef}
            action={clientAction}
            className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg shadow-sm flex flex-wrap gap-4 items-end mb-8"
        >
            <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
                <label htmlFor="driver_name" className="text-xs font-medium text-zinc-400">
                    Driver Name
                </label>
                <input
                    id="driver_name"
                    name="driver_name"
                    type="text"
                    placeholder="e.g. John Doe"
                    required
                    className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600"
                />
            </div>

            <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
                <label htmlFor="work_date" className="text-xs font-medium text-zinc-400">
                    Date
                </label>
                <input
                    id="work_date"
                    name="work_date"
                    type="date"
                    required
                    className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all [color-scheme:dark]"
                />
            </div>

            <div className="flex flex-col gap-1.5 w-[120px]">
                <label htmlFor="target_hours" className="text-xs font-medium text-zinc-400">
                    Target (h)
                </label>
                <input
                    id="target_hours"
                    name="target_hours"
                    type="number"
                    step="0.1"
                    placeholder="8.0"
                    required
                    className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600"
                />
            </div>

            <div className="flex flex-col gap-1.5 w-[120px]">
                <label htmlFor="actual_hours" className="text-xs font-medium text-zinc-400">
                    Actual (h)
                </label>
                <input
                    id="actual_hours"
                    name="actual_hours"
                    type="number"
                    step="0.1"
                    placeholder="7.5"
                    required
                    className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600"
                />
            </div>

            <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium h-[38px] px-4 rounded-md flex items-center gap-2 transition-colors cursor-pointer"
            >
                <PlusCircle size={16} />
                Add Entry
            </button>
        </form>
    )
}
