'use client';

import { login, signup } from './actions';
import { Clock } from 'lucide-react';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

function LoginContent() {
    const router = useRouter();
    const supabase = createClient();
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    const plan = searchParams.get('plan');
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(error);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setFormError(null);

        const formData = new FormData(event.currentTarget);
        const action = isSignUp ? signup : login;

        try {
            const result = await action(formData);

            if (result?.error) {
                setFormError(result.error);
                return;
            }

            // Success! Check for plan and redirect
            if (plan) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user && user.email) {
                    let stripeLink = '';
                    if (plan === 'basis') stripeLink = 'https://buy.stripe.com/cNi3cv40t6IS1f54kEebu00';
                    if (plan === 'pro') stripeLink = 'https://buy.stripe.com/bJe9AT40t1oy3ndg3mebu01';
                    if (plan === 'premium') stripeLink = 'https://buy.stripe.com/28E5kD7cF6IS7DtaJ2ebu02';

                    if (stripeLink) {
                        const checkoutUrl = `${stripeLink}?prefilled_email=${encodeURIComponent(user.email)}&client_reference_id=${user.id}`;
                        window.location.href = checkoutUrl;
                        return;
                    }
                }
            }

            // Default redirect
            router.push('/dashboard');
            router.refresh();

        } catch (err: any) {
            console.error("Auth Error:", err);
            setFormError('Ein unerwarteter Fehler ist aufgetreten.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-emerald-500/30">
            <div className="w-full max-w-md space-y-8 ">
                <div className="flex flex-col items-center text-center">
                    <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 mb-4">
                        <Clock className="text-emerald-500" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">TimeNova</h1>
                    <p className="text-zinc-400 mt-2">
                        {isSignUp ? 'Create a new account' : 'Sign in to track your working hours'}
                    </p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-xl shadow-lg backdrop-blur-sm">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {isSignUp && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="first_name" className="text-sm font-medium text-zinc-300">
                                            Vorname
                                        </label>
                                        <input
                                            id="first_name"
                                            name="first_name"
                                            type="text"
                                            required={isSignUp}
                                            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600"
                                            placeholder="Max"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="last_name" className="text-sm font-medium text-zinc-300">
                                            Nachname
                                        </label>
                                        <input
                                            id="last_name"
                                            name="last_name"
                                            type="text"
                                            required={isSignUp}
                                            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600"
                                            placeholder="Mustermann"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="company_name" className="text-sm font-medium text-zinc-300">
                                        Unternehmensname
                                    </label>
                                    <input
                                        id="company_name"
                                        name="company_name"
                                        type="text"
                                        required={isSignUp}
                                        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600"
                                        placeholder="Taxi Mustermann GmbH"
                                    />
                                </div>
                            </>
                        )}

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

                        {formError && (
                            <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-sm text-red-500 text-center font-bold animate-in fade-in slide-in-from-top-2">
                                {formError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full font-medium py-3 rounded-lg transition-all cursor-pointer text-lg shadow-lg flex justify-center items-center gap-2 ${isLoading
                                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Clock className="animate-spin" size={20} />
                                    Lädt...
                                </>
                            ) : (
                                isSignUp ? 'Jetzt Registrieren' : 'Anmelden'
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setFormError(null);
                                }}
                                className="text-sm text-zinc-400 hover:text-white underline transition-colors"
                            >
                                {isSignUp ? 'Bereits einen Account? Hier anmelden' : 'Noch keinen Account? Hier registrieren'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Lade...</div>}>
            <LoginContent />
        </Suspense>
    );
}