import { getEntries, getDriverStats, deleteEntry } from './actions'
import TimeEntryForm from '@/components/TimeEntryForm'
import DriverLeaderboard from '@/components/DriverLeaderboard'
import { Clock, TrendingUp, TrendingDown, Target, Trash2 } from 'lucide-react'
import clsx from 'clsx'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [entries, driverStats] = await Promise.all([
    getEntries(),
    getDriverStats()
  ])

  const totalTarget = entries.reduce((acc, entry) => acc + (Number(entry.target_hours) || 0), 0)
  const totalActual = entries.reduce((acc, entry) => acc + (Number(entry.actual_hours) || 0), 0)
  const totalBalance = totalActual - totalTarget

  return (
    <main className="min-h-screen bg-black text-zinc-100 p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Clock className="text-emerald-500" size={32} />
              DriverTime
            </h1>
            <p className="text-zinc-400 mt-1">Track your driving hours against targets.</p>
          </div>

          <div className="flex gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 min-w-[160px]">
              <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Total Target</div>
              <div className="text-2xl font-bold text-zinc-100">{totalTarget.toFixed(1)}h</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 min-w-[160px]">
              <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Total Actual</div>
              <div className="text-2xl font-bold text-zinc-100">{totalActual.toFixed(1)}h</div>
            </div>
            <div
              className={clsx(
                'rounded-lg p-4 min-w-[180px] border',
                totalBalance >= 0
                  ? 'bg-emerald-950/30 border-emerald-900/50'
                  : 'bg-rose-950/30 border-rose-900/50'
              )}
            >
              <div
                className={clsx(
                  'text-xs font-medium uppercase tracking-wider mb-1',
                  totalBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                )}
              >
                Hours Balance
              </div>
              <div
                className={clsx(
                  'text-3xl font-bold flex items-center gap-2',
                  totalBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                )}
              >
                {totalBalance > 0 ? '+' : ''}
                {totalBalance.toFixed(1)}h
                {totalBalance >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              </div>
            </div>
          </div>
        </header>

        {/* Input Form */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
            <Target size={20} className="text-zinc-500" />
            New Entry
          </h2>
          <TimeEntryForm />
        </section>

        {/* Driver Leaderboard */}
        <DriverLeaderboard stats={driverStats} />

        {/* Table */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-200">History</h2>
            <div className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
              {entries.length} entries found
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Driver</th>
                  <th className="px-6 py-4 font-medium text-right">Target (h)</th>
                  <th className="px-6 py-4 font-medium text-right">Actual (h)</th>
                  <th className="px-6 py-4 font-medium text-right">Difference</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 italic">
                      No entries yet. Start by adding one above.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => {
                    const diff = Number(entry.actual_hours) - Number(entry.target_hours)
                    const isPositive = diff > 0
                    const isNegative = diff < 0
                    const isExact = diff === 0

                    return (
                      <tr key={entry.id} className="group hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4 text-zinc-300 font-medium">
                          {new Date(entry.work_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-zinc-300">{entry.driver_name}</td>
                        <td className="px-6 py-4 text-right text-zinc-400 font-mono">
                          {Number(entry.target_hours).toFixed(1)}
                        </td>
                        <td className="px-6 py-4 text-right text-zinc-200 font-mono font-bold">
                          {Number(entry.actual_hours).toFixed(1)}
                        </td>
                        <td
                          className={clsx(
                            'px-6 py-4 text-right font-bold font-mono',
                            isPositive && 'text-emerald-400',
                            isNegative && 'text-rose-400',
                            isExact && 'text-zinc-500'
                          )}
                        >
                          {isPositive ? '+' : ''}
                          {diff.toFixed(1)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={clsx(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                              isPositive &&
                              'bg-emerald-950/30 text-emerald-400 border-emerald-900/50',
                              isNegative &&
                              'bg-rose-950/30 text-rose-400 border-rose-900/50',
                              isExact &&
                              'bg-zinc-800 text-zinc-400 border-zinc-700'
                            )}
                          >
                            {isPositive && 'Overperform'}
                            {isNegative && 'Underperform'}
                            {isExact && 'Exact'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right align-middle">
                          <form action={deleteEntry}>
                            <input type="hidden" name="id" value={entry.id} />
                            <button
                              type="submit"
                              className="text-zinc-600 hover:text-rose-500 transition-colors cursor-pointer p-1.5 rounded-md hover:bg-rose-950/30"
                              title="Delete Entry"
                            >
                              <Trash2 size={16} />
                            </button>
                          </form>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
