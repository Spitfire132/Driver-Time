import { login, signup } from './actions'
import { Clock } from 'lucide-react'

export default async function LoginPage(props: {
    searchParams: Promise<{ error?: string }>
}) {
    const searchParams = await props.searchParams
    return (
        <main className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-emerald-500/30">
            <div className="w-full max-w-md space-y-8 ">
                <div className="flex flex-col items-center text-center">
                    <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 mb-4">
                        <Clock className="text-emerald-500" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">DriverTime</h1>
                    <p className="text-zinc-400 mt-2">Sign in to track your driving hours</p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-xl shadow-lg backdrop-blur-sm">
                    <form className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600"
                                placeholder="••••••••"
                            />
                        </div>

                        {searchParams?.error && (
                            <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-lg text-sm text-rose-400 text-center">
                                {searchParams.error}
                            </div>
                        )}

                        <div className="flex gap-4 pt-2">
                            <button
                                formAction={login}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
                            >
                                Log In
                            </button>
                            <button
                                formAction={signup}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium py-2.5 rounded-lg transition-colors cursor-pointer border border-zinc-700"
                            >
                                Sign Up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    )
}
