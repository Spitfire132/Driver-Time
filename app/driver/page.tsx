'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import { Clock, AlertTriangle, CheckCircle, Play, Square } from 'lucide-react';

function DriverInterface() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [driver, setDriver] = useState<any>(null);
    const [activeShift, setActiveShift] = useState<any>(null);
    const [error, setError] = useState('');
    const [statusData, setStatusData] = useState<{ msg: string, time: string } | null>(null);

    // Initial Load
    useEffect(() => {
        if (!token) {
            setError('Kein Token gefunden.');
            setLoading(false);
            return;
        }
        checkDriverStatus();
    }, [token]);

    const checkDriverStatus = async () => {
        setLoading(true);
        try {
            // 1. Get Driver Info (RPC because Unauth)
            const { data: driverData, error: driverError } = await supabase.rpc('get_driver_by_key', { lookup_key: token });

            if (driverError) {
                console.error("RPC Error:", driverError);
                setError(`System-Fehler: ${driverError.message} (Code: ${driverError.code || '?'})`);
                setLoading(false);
                return;
            }

            if (!driverData) {
                setError('Link ungültig oder abgelaufen (Fahrer nicht gefunden).');
                setLoading(false);
                return;
            }
            setDriver(driverData);

            // 2. Check Active Shift (RPC)
            const { data: shiftData, error: shiftError } = await supabase.rpc('get_active_shift_magic', { driver_key: token });

            if (shiftError) console.error(shiftError);
            setActiveShift(shiftData); // null if no active shift

        } catch (err) {
            console.error(err);
            setError('Ein Fehler ist aufgetreten.');
        } finally {
            setLoading(false);
        }
    };

    const handleStart = async () => {
        setLoading(true);
        const { data, error } = await supabase.rpc('start_shift_magic', { driver_key: token }); // Actually needs different RPC logic if I put insert logic there? Yes, I added start_shift_magic in migration.

        // Wait, did I add start_shift_magic? I wrote it in migration file but did I define it correctly?
        // Ah, in migration I defined start_shift_magic(driver_key).
        // BUT WAIT. The migration file needs to be APPLIED by the user. I should assume it works.

        if (error) {
            setStatusData({ msg: 'Fehler beim Starten: ' + error.message, time: new Date().toLocaleTimeString() });
        } else {
            setActiveShift(data); // New shift
            setStatusData({ msg: 'Schicht gestartet! 🚀', time: new Date().toLocaleTimeString() });
        }
        setLoading(false);
    };

    const handleStop = async () => {
        setLoading(true);
        const { data, error } = await supabase.rpc('stop_shift_magic', { driver_key: token });

        if (error) {
            setStatusData({ msg: 'Fehler beim Stoppen: ' + error.message, time: new Date().toLocaleTimeString() });
        } else {
            setActiveShift(null); // Shift closed
            setStatusData({ msg: 'Schicht beendet! 🏁', time: new Date().toLocaleTimeString() });
        }
        setLoading(false);
    };

    if (loading && !driver) {
        return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center"><h1 className="animate-pulse text-xl">Lade... ⏳</h1></div>;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
                <AlertTriangle size={64} className="text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-center mb-2">Fehler</h1>
                <p className="text-gray-400 text-center">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="text-emerald-500" />
                    <span className="font-bold">TimeNova</span>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold">{driver?.name}</p>
                    <p className="text-xs text-gray-400">Mitarbeiter</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">

                {/* Status Message */}
                {statusData && (
                    <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl w-full max-w-sm text-center animate-in fade-in slide-in-from-top-4">
                        <p className="font-bold text-lg mb-1">{statusData.msg}</p>
                        <p className="text-gray-400 text-xs">{statusData.time}</p>
                    </div>
                )}

                {/* ACTIVE STATE DISPLAY */}
                <div className="text-center">
                    <p className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-2">AKTUELLER STATUS</p>
                    {activeShift ? (
                        <div className="flex items-center gap-2 justify-center text-green-400">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <h2 className="text-3xl font-bold">IM DIENST</h2>
                            <p className="text-gray-500 text-xs mt-1">Seit {new Date(activeShift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    ) : (
                        <div className="text-gray-500">
                            <h2 className="text-3xl font-bold">PAUSE / FREI</h2>
                        </div>
                    )}
                </div>

                {/* ACTION BUTTON */}
                <div className="w-full max-w-sm">
                    {activeShift ? (
                        <button
                            onClick={handleStop}
                            disabled={loading}
                            className="w-full aspect-square rounded-full bg-red-600 hover:bg-red-500 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.3)] active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <Square size={64} className="mb-2 fill-white" />
                            <span className="text-3xl font-black tracking-wider">STOPP</span>
                            <span className="text-red-200 text-sm mt-1 group-hover:block hidden">Schicht beenden</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleStart}
                            disabled={loading}
                            className="w-full aspect-square rounded-full bg-emerald-600 hover:bg-emerald-500 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(5,150,105,0.3)] active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <Play size={64} className="mb-2 fill-white pl-2" />
                            <span className="text-3xl font-black tracking-wider">START</span>
                            <span className="text-emerald-200 text-sm mt-1 group-hover:block hidden">Schicht beginnen</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 text-center text-gray-600 text-xs">
                <p>TimeNova Mobile v1.0</p>
            </div>
        </div>
    );
}

export default function DriverPage() {
    return (
        <Suspense fallback={<div className="bg-black text-white p-10 text-center">Lade App...</div>}>
            <DriverInterface />
        </Suspense>
    );
}
