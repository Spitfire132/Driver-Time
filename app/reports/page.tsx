'use client'

import { useState, useEffect } from 'react'
import { getDriversList, getDriverReport } from '../actions'
import { Printer, Calendar, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'

export default function ReportsPage() {
    const [drivers, setDrivers] = useState<string[]>([])
    const [selectedDriver, setSelectedDriver] = useState('')
    const [selectedMonth, setSelectedMonth] = useState('')
    const [reportData, setReportData] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getDriversList().then(setDrivers)

        // Set default month to current month
        const now = new Date()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const year = now.getFullYear()
        setSelectedMonth(`${year}-${month}`)
    }, [])

    const handleGenerate = async () => {
        if (!selectedDriver || !selectedMonth) return

        setLoading(true)
        try {
            const data = await getDriverReport(selectedDriver, selectedMonth)
            setReportData(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <main className="min-h-screen bg-black text-zinc-100 p-8 font-sans selection:bg-emerald-500/30 print:bg-white print:text-black print:p-0">
            <div className="max-w-4xl mx-auto print:max-w-none">

                {/* Navigation & Header - Hidden in Print */}
                <div className="mb-8 print:hidden">
                    <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-white mb-6 transition-colors">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Dashboard
                    </Link>

                    <h1 className="text-3xl font-bold text-white mb-2">Reports & Export</h1>
                    <p className="text-zinc-400">Generate and print monthly performance reports.</p>
                </div>

                {/* Filters - Hidden in Print */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl mb-8 print:hidden space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <User size={16} /> Driver
                        </label>
                        <select
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/50"
                            value={selectedDriver}
                            onChange={(e) => setSelectedDriver(e.target.value)}
                        >
                            <option value="">Select a driver...</option>
                            {drivers.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <Calendar size={16} /> Month
                        </label>
                        <input
                            type="month"
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/50 [color-scheme:dark]"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleGenerate}
                            disabled={!selectedDriver || !selectedMonth || loading}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
                        >
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>

                        {reportData && (
                            <button
                                onClick={handlePrint}
                                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2.5 rounded-lg transition-colors border border-zinc-700 flex items-center gap-2"
                            >
                                <Printer size={18} /> Print PDF
                            </button>
                        )}
                    </div>
                </div>

                {/* Report Content */}
                {reportData && (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden print:bg-white print:border-none print:shadow-none p-8 print:p-8">

                        {/* Report Header */}
                        <div className="border-b border-zinc-800 print:border-zinc-200 pb-6 mb-6 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-white print:text-black mb-1">Driver Performance Report</h2>
                                <p className="text-zinc-400 print:text-zinc-600">Generated via DriverTime</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-semibold text-white print:text-black">{selectedDriver}</div>
                                <div className="text-zinc-400 print:text-zinc-600 font-mono">
                                    {new Date(`${selectedMonth}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg print:bg-gray-50 print:border-gray-200">
                                <div className="text-xs text-zinc-500 print:text-zinc-500 uppercase font-medium mb-1">Total Target</div>
                                <div className="text-xl font-bold text-zinc-200 print:text-black">{reportData.summary.totalTarget.toFixed(1)}h</div>
                            </div>
                            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg print:bg-gray-50 print:border-gray-200">
                                <div className="text-xs text-zinc-500 print:text-zinc-500 uppercase font-medium mb-1">Total Actual</div>
                                <div className="text-xl font-bold text-zinc-200 print:text-black">{reportData.summary.totalActual.toFixed(1)}h</div>
                            </div>
                            <div className={clsx(
                                "p-4 border rounded-lg print:bg-gray-50 print:border-gray-200",
                                reportData.summary.balance >= 0
                                    ? "bg-emerald-950/30 border-emerald-900/50"
                                    : "bg-rose-950/30 border-rose-900/50"
                            )}>
                                <div className={clsx(
                                    "text-xs uppercase font-medium mb-1",
                                    reportData.summary.balance >= 0 ? "text-emerald-400 print:text-emerald-700" : "text-rose-400 print:text-red-700"
                                )}>Balance</div>
                                <div className={clsx(
                                    "text-xl font-bold",
                                    reportData.summary.balance >= 0 ? "text-emerald-400 print:text-emerald-700" : "text-rose-400 print:text-red-700"
                                )}>
                                    {reportData.summary.balance > 0 ? '+' : ''}{reportData.summary.balance.toFixed(1)}h
                                </div>
                            </div>
                        </div>

                        {/* Detailed Table */}
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-zinc-800 print:border-zinc-300 text-zinc-400 print:text-zinc-600">
                                    <th className="py-3 font-medium">Date</th>
                                    <th className="py-3 font-medium text-right">Target</th>
                                    <th className="py-3 font-medium text-right">Actual</th>
                                    <th className="py-3 font-medium text-right">Diff</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50 print:divide-zinc-200">
                                {reportData.entries.map((entry: any) => {
                                    const diff = Number(entry.actual_hours) - Number(entry.target_hours)
                                    const isPositive = diff > 0
                                    const isNegative = diff < 0

                                    return (
                                        <tr key={entry.id} className="print:text-black">
                                            <td className="py-3 text-zinc-300 print:text-black font-medium">
                                                {new Date(entry.work_date).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 text-right text-zinc-400 print:text-black font-mono">
                                                {Number(entry.target_hours).toFixed(1)}
                                            </td>
                                            <td className="py-3 text-right text-zinc-200 print:text-black font-mono font-bold">
                                                {Number(entry.actual_hours).toFixed(1)}
                                            </td>
                                            <td className={clsx(
                                                "py-3 text-right font-mono font-bold",
                                                isPositive && "text-emerald-400 print:text-emerald-700",
                                                isNegative && "text-rose-400 print:text-red-700",
                                                diff === 0 && "text-zinc-500 print:text-gray-500"
                                            )}>
                                                {isPositive ? '+' : ''}{diff.toFixed(1)}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    )
}
