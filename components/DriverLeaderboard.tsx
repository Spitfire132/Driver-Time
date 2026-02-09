import { TrendingUp, TrendingDown, User } from 'lucide-react'
import clsx from 'clsx'

type DriverStat = {
    driver_name: string
    total_target: number
    total_actual: number
    balance: number
}

export default function DriverLeaderboard({ stats }: { stats: DriverStat[] }) {
    if (stats.length === 0) return null

    return (
        <div className="mb-10">
            <h2 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                <User size={20} className="text-zinc-500" />
                Driver Leaderboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat) => {
                    const isPositive = stat.balance > 0
                    const isNegative = stat.balance < 0
                    const isNeutral = stat.balance === 0

                    return (
                        <div
                            key={stat.driver_name}
                            className={clsx(
                                'border rounded-lg p-5 transition-shadow hover:shadow-md',
                                isPositive && 'bg-emerald-950/20 border-emerald-900/50',
                                isNegative && 'bg-rose-950/20 border-rose-900/50',
                                isNeutral && 'bg-zinc-900 border-zinc-800'
                            )}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-medium text-white truncate pr-2">{stat.driver_name}</h3>
                                {isPositive && <span className="text-xs font-bold text-emerald-500 bg-emerald-950/50 px-2 py-1 rounded-full border border-emerald-900/50">🔥 Best</span>}
                            </div>

                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-sm text-zinc-400">Total Balance:</span>
                                <span
                                    className={clsx(
                                        'text-xl font-bold flex items-center gap-1',
                                        isPositive && 'text-emerald-400',
                                        isNegative && 'text-rose-400',
                                        isNeutral && 'text-zinc-400'
                                    )}
                                >
                                    {isPositive && '+'}
                                    {stat.balance.toFixed(1)}h
                                    {isPositive && <TrendingUp size={16} />}
                                    {isNegative && <TrendingDown size={16} />}
                                </span>
                            </div>

                            <div className="text-xs text-zinc-500 flex gap-3 mt-3 pt-3 border-t border-white/5">
                                <div>
                                    Target: <span className="text-zinc-300">{stat.total_target.toFixed(1)}h</span>
                                </div>
                                <div>
                                    Actual: <span className="text-zinc-300">{stat.total_actual.toFixed(1)}h</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
