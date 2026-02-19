"use client";

import { useState, useEffect } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { Check, ArrowLeft, Star, X } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
    const [plan, setPlan] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null); // Store user object
    const supabase = createClient();

    useEffect(() => {
        const fetchPlan = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user); // Save user for Stripe Link
                const { data } = await supabase
                    .from('profiles')
                    .select('subscription_plan')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setPlan(data.subscription_plan);
                } else {
                    setPlan('trial');
                }
            }
            setLoading(false);
        };
        fetchPlan();
    }, []);

    const handleUpgrade = (tier: string) => {
        if (!user) return;

        const email = encodeURIComponent(user.email);
        const userId = user.id;

        let url = '';
        if (tier === 'basis') url = 'https://buy.stripe.com/cNi3cv40t6IS1f54kEebu00';
        if (tier === 'pro') url = 'https://buy.stripe.com/bJe9AT40t1oy3ndg3mebu01';
        if (tier === 'premium') url = 'https://buy.stripe.com/28E5kD7cF6IS7DtaJ2ebu02';

        if (url) {
            window.location.href = `${url}?prefilled_email=${email}&client_reference_id=${userId}`;
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center animate-pulse">Lade Preise... ⏳</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition">
                    <ArrowLeft size={20} className="mr-2" /> Zurück zum Dashboard
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Wähle den passenden Tarif für dein Team</h1>
                    <p className="text-gray-400">Upgrade jederzeit möglich. Keine versteckten Kosten.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

                    {/* BASIS */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col h-full hover:border-gray-700 transition">
                        <h2 className="text-xl font-bold text-gray-300 mb-2">Basis</h2>
                        <div className="text-3xl font-bold mb-6">19€ <span className="text-sm text-gray-500 font-normal">/ Monat</span></div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-gray-300"><Check size={18} className="text-gray-500" /> Max. 5 Mitarbeiter</li>
                            <li className="flex items-center gap-3 text-sm text-gray-300"><Check size={18} className="text-gray-500" /> Manuelle Zeiterfassung</li>
                            <li className="flex items-center gap-3 text-sm text-gray-300"><Check size={18} className="text-gray-500" /> GoBD Audit-Log</li>
                            <li className="flex items-center gap-3 text-sm text-gray-300"><Check size={18} className="text-gray-500" /> Berichte & Filter</li>
                        </ul>
                        <button
                            onClick={() => handleUpgrade('basis')}
                            disabled={plan === 'basis'}
                            className={`w-full py-3 rounded-lg font-bold transition ${plan === 'basis' ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}
                        >
                            {plan === 'basis' ? 'Aktueller Tarif' : 'Basis wählen'}
                        </button>
                    </div>

                    {/* PRO (Bestseller) - Badge removed for transparency */}
                    <div className="bg-gray-900 border-2 border-green-500 rounded-2xl p-8 flex flex-col h-full relative transform md:-translate-y-4 shadow-2xl shadow-green-900/20">
                        <h2 className="text-xl font-bold text-green-400 mb-2">Pro</h2>
                        <div className="text-4xl font-bold mb-6 text-white">39€ <span className="text-sm text-gray-500 font-normal">/ Monat</span></div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm"><Check size={18} className="text-green-500" /> <span className="font-bold text-white">Max. 20 Mitarbeiter</span></li>
                            <li className="flex items-center gap-3 text-sm"><Check size={18} className="text-green-500" /> 1-Klick Magic Links (App)</li>
                            <li className="flex items-center gap-3 text-sm"><Check size={18} className="text-green-500" /> GoBD Audit-Log</li>
                            <li className="flex items-center gap-3 text-sm"><Check size={18} className="text-green-500" /> Berichte & Filter</li>
                        </ul>
                        <button
                            onClick={() => handleUpgrade('pro')}
                            disabled={plan === 'pro'}
                            className={`w-full py-3 rounded-lg font-bold transition ${plan === 'pro' ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-black hover:bg-green-400 shadow-lg hover:shadow-green-500/25'}`}
                        >
                            {plan === 'pro' ? 'Aktueller Tarif' : 'Auf Pro upgraden'}
                        </button>
                    </div>

                    {/* PREMIUM */}
                    <div className="bg-gray-900 border border-purple-900/50 rounded-2xl p-8 flex flex-col h-full hover:border-purple-500/50 transition">
                        <h2 className="text-xl font-bold text-purple-400 mb-2">Premium</h2>
                        <div className="text-3xl font-bold mb-6">79€ <span className="text-sm text-gray-500 font-normal">/ Monat</span></div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-gray-300"><Check size={18} className="text-purple-500" /> <span className="font-bold text-white">Unbegrenzte Mitarbeiter</span></li>
                            <li className="flex items-center gap-3 text-sm text-gray-300"><Check size={18} className="text-purple-500" /> Alle Pro-Funktionen</li>
                            <li className="flex items-center gap-3 text-sm text-gray-300"><Check size={18} className="text-purple-500" /> VIP Support</li>
                        </ul>
                        <button
                            onClick={() => handleUpgrade('premium')}
                            disabled={plan === 'premium'}
                            className={`w-full py-3 rounded-lg font-bold transition ${plan === 'premium' ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg hover:shadow-purple-500/25'}`}
                        >
                            {plan === 'premium' ? 'Aktueller Tarif' : 'Auf Premium upgraden'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
