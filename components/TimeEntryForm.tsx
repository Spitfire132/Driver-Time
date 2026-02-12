"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../utils/supabase/client';

export default function TimeEntryForm() {
    const router = useRouter();
    const supabase = createClient();

    // --- STATE VARIABLES ---
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [view, setView] = useState<'dashboard' | 'audit' | 'reports'>('dashboard');

    // Daten
    const [drivers, setDrivers] = useState<any[]>([]);
    const [shifts, setShifts] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    // Report State
    const [reportDriver, setReportDriver] = useState('');
    const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [reportData, setReportData] = useState<any[]>([]);
    const [reportSummary, setReportSummary] = useState({ totalHours: 0, totalBreaks: 0 });

    // Report Fetcher Trigger
    useEffect(() => {
        if (view === 'reports') {
            fetchReport();
        }
    }, [view, reportDriver, reportMonth]);

    // Formular Eingaben
    const [selectedDriver, setSelectedDriver] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('17:00');
    const [pause, setPause] = useState(0);
    const [newDriverName, setNewDriverName] = useState('');

    const [successMsg, setSuccessMsg] = useState('');

    // --- 1. SESSION CHECK (Stabilisiert) ---
    useEffect(() => {
        async function init() {
            try {
                // Prüfen, ob eine Session existiert
                const { data, error } = await supabase.auth.getSession();

                if (error || !data.session) {
                    console.log("Keine Session gefunden.");
                    setUser(null);
                    setLoading(false);
                    return; // Hier brechen wir ab -> Login Screen wird angezeigt
                }

                // Wenn wir hier sind, IST der User eingeloggt
                setUser(data.session.user);

                // Jetzt laden wir die Daten parallel
                await Promise.all([fetchDrivers(), fetchShifts()]);

                setLoading(false);
            } catch (err) {
                console.error("Init Fehler:", err);
                setLoading(false);
            }
        }
        init();
    }, []);

    // Wenn Ansicht auf 'Audit' gewechselt wird, lade Logs
    useEffect(() => {
        if (view === 'audit' && user) fetchAuditLogs();
    }, [view, user]);

    // Timer für Erfolgsmeldung
    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    // --- 2. PAUSEN BERECHNUNG ---
    useEffect(() => {
        const startIso = new Date(`${date}T${startTime}`);
        let endDateObj = new Date(`${date}T${endTime}`);

        if (endDateObj < startIso) {
            endDateObj.setDate(endDateObj.getDate() + 1);
        }

        const diffMs = endDateObj.getTime() - startIso.getTime();
        const hoursTotal = diffMs / (1000 * 60 * 60);

        let newPause = 0;
        if (hoursTotal > 9) newPause = 45;
        else if (hoursTotal > 6) newPause = 30;

        setPause(newPause);
    }, [date, startTime, endTime]);

    // --- 3. DATENBANK FUNKTIONEN ---
    const fetchDrivers = async () => {
        const { data } = await supabase.from('drivers').select('*');
        if (data) setDrivers(data);
    };

    const fetchShifts = async () => {
        const { data, error } = await supabase
            .from('shifts')
            .select('*, drivers(name)')
            .order('start_time', { ascending: false });

        if (error) {
            console.error('Error fetching shifts:', error);
            // Für die Diagnose:
            alert("Fehler beim Laden der Schichten: " + error.message);
        }

        if (data) {
            setShifts(data);
        }
    };

    const fetchAuditLogs = async () => {
        const { data } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        if (data) setAuditLogs(data);
    };

    const fetchReport = async () => {
        let query = supabase
            .from('shifts')
            .select('*, drivers(name)')
            .order('start_time', { ascending: true });

        if (reportDriver) {
            query = query.eq('driver_id', reportDriver);
        }

        // Filter by Month
        const startDate = `${reportMonth}-01`;
        // Calculate end of month
        const [y, m] = reportMonth.split('-').map(Number);
        const endDate = new Date(y, m, 0).toISOString().split('T')[0]; // Last day of month

        // Supabase range filter
        query = query.gte('start_time', startDate).lte('end_time', `${endDate}T23:59:59`);

        const { data, error } = await query;

        if (data) {
            setReportData(data);

            // Calculate Totals
            let totalRes = 0;
            let breakRes = 0;
            data.forEach(s => {
                const start = new Date(s.start_time).getTime();
                const end = new Date(s.end_time).getTime();
                const duration = (end - start) / (1000 * 60 * 60); // ms -> hours
                const net = duration - (s.break_minutes / 60);
                totalRes += net;
                breakRes += s.break_minutes;
            });
            setReportSummary({
                totalHours: totalRes,
                totalBreaks: breakRes
            });
        }
    };

    // --- 4. BUTTON AKTIONEN ---
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh(); // Seite neu laden
        window.location.href = '/login'; // Harter Redirect
    };

    const addDriver = async () => {
        if (!newDriverName) return alert("Bitte Namen eingeben");

        // 1. Fahrer anlegen
        const { data, error } = await supabase
            .from('drivers')
            .insert([{ name: newDriverName, boss_id: user.id }])
            .select();

        if (error) {
            alert(error.message);
        } else {
            // 2. Audit Log Eintrag
            if (data && data.length > 0) {
                await supabase.from('audit_logs').insert([{
                    user_id: user.id,
                    action: 'INSERT',
                    table_name: 'drivers',
                    details: `Neuer Fahrer: ${newDriverName} (ID: ${data[0].id})`
                }]);
            }

            setNewDriverName('');
            fetchDrivers();
            setSuccessMsg(`Fahrer "${newDriverName}" erfolgreich angelegt! ✅`);
        }
    };

    const saveShift = async (e: any) => {
        e.preventDefault();
        if (!selectedDriver) return alert("Bitte Fahrer wählen");

        const startIso = new Date(`${date}T${startTime}:00`).toISOString();
        let endDateObj = new Date(`${date}T${endTime}:00`);

        if (endDateObj < new Date(`${date}T${startTime}:00`)) {
            endDateObj.setDate(endDateObj.getDate() + 1);
        }

        // 1. Schicht speichern
        // Explicitly set user_id: user.id to be safe
        const { data, error } = await supabase.from('shifts').insert([{
            user_id: user.id,
            driver_id: selectedDriver,
            start_time: startIso,
            end_time: endDateObj.toISOString(),
            break_minutes: pause
        }]).select();

        if (error) {
            alert(error.message);
        } else {
            // Fahrer Name ermitteln
            const driverName = drivers.find(d => d.id === selectedDriver)?.name || "Unbekannt";

            // 2. Audit Log Eintrag
            if (data && data.length > 0) {
                await supabase.from('audit_logs').insert([{
                    user_id: user.id,
                    action: 'INSERT',
                    table_name: 'shifts',
                    details: `Neuer Eintrag: ${driverName} am ${date}`
                }]);
            }

            fetchShifts();
            if (view === 'audit') fetchAuditLogs();
            setSuccessMsg("Eintrag erfolgreich gespeichert! ✅");
        }
    };

    const calculateNetDuration = (s: string, e: string, p: number) => {
        if (!s || !e) return "0.00";
        const diff = (new Date(e).getTime() - new Date(s).getTime()) - (p * 60000);
        return (diff / 3600000).toFixed(2);
    };

    const timeOptions = Array.from({ length: 96 }).map((_, i) => {
        const h = Math.floor(i / 4).toString().padStart(2, '0');
        const m = ((i % 4) * 15).toString().padStart(2, '0');
        return `${h}:${m}`;
    });

    // Helper für sicheren Namenszugriff (Array oder Objekt)
    const getDriverName = (driverRelation: any) => {
        if (!driverRelation) return 'Unbekannt';
        if (Array.isArray(driverRelation)) {
            return driverRelation[0]?.name || 'Unbekannt';
        }
        return driverRelation.name || 'Unbekannt';
    };

    const getMonthOptions = () => {
        const options = [];
        const today = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const value = d.toISOString().slice(0, 7); // YYYY-MM
            const label = d.toLocaleString('de-DE', { month: 'long', year: 'numeric' });
            options.push({ value, label });
        }
        return options;
    };

    const deleteDriver = async (id: string, name: string) => {
        if (!confirm(`Soll der Fahrer "${name}" wirklich gelöscht werden? Alle zugehörigen Schichten könnten ebenfalls gelöscht werden!`)) return;

        const { error } = await supabase.from('drivers').delete().eq('id', id);

        if (error) {
            alert("Fehler beim Löschen des Fahrers: " + error.message);
        } else {
            // 2. Audit Log
            await supabase.from('audit_logs').insert([{
                user_id: user.id,
                action: 'DELETE',
                table_name: 'drivers',
                details: `GELÖSCHT: Fahrer ${name} (ID: ${id})`
            }]);

            setDrivers(prev => prev.filter(d => d.id !== id));
            setSuccessMsg(`Fahrer "${name}" gelöscht! 🗑️`);
            if (view === 'audit') fetchAuditLogs();
        }
    };

    // --- ANZEIGE LOGIK ---

    const deleteShift = async (id: string, driverName: string, dateStr: string, timeRange: string) => {
        if (!confirm(`Soll der Eintrag von ${driverName} am ${dateStr} (${timeRange}) wirklich gelöscht werden?`)) return;

        // 1. Aus DB löschen
        const { error } = await supabase.from('shifts').delete().eq('id', id);

        if (error) {
            alert("Fehler beim Löschen: " + error.message);
        } else {
            // 2. Audit Log
            await supabase.from('audit_logs').insert([{
                user_id: user.id,
                action: 'DELETE',
                table_name: 'shifts',
                details: `GELÖSCHT: Fahrer ${driverName} | Datum: ${dateStr} | Zeit: ${timeRange} | (ID: ${id})`
            }]);

            // 3. UI Update (Optimistisch)
            setShifts(prev => prev.filter(s => s.id !== id));
            setSuccessMsg("Eintrag erfolgreich gelöscht! 🗑️");
            if (view === 'audit') fetchAuditLogs();
        }
    };

    // --- ANZEIGE LOGIK ---

    // 1. Ladebildschirm
    if (loading) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <h1 className="text-2xl animate-pulse">Lade System... ⏳</h1>
        </div>;
    }

    // 2. Nicht eingeloggt Bildschirm (Verhindert den Loop!)
    if (!user) {
        // ... (Code wie vorher)
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
                <h1 className="text-3xl text-red-500 font-bold mb-4">Nicht eingeloggt</h1>
                <p className="mb-8 text-gray-400">Bitte melde dich an, um das Dashboard zu sehen.</p>
                <button
                    onClick={() => window.location.href = '/login'}
                    className="bg-white text-black font-bold py-3 px-8 rounded hover:bg-gray-200 transition"
                >
                    Zum Login 👉
                </button>
            </div>
        );
    }

    // 3. Das Dashboard (Nur sichtbar wenn User da ist)
    return (
        <div className="bg-black text-white p-6 font-sans rounded-lg min-h-screen">
            {/* HEADER */}
            <div className="no-print border-b border-gray-800 pb-6 mb-6 print:hidden">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">🚕 DriverTime</h1>
                        <p className="text-gray-500 text-sm">Track your driving hours.</p>
                    </div>
                    <button onClick={handleSignOut} className="bg-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-700 border border-gray-700">
                        Sign Out
                    </button>
                </div>

                {/* TABS */}
                <div className="flex gap-4">
                    <button onClick={() => setView('dashboard')} className={`pb-2 px-2 font-bold ${view === 'dashboard' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-500'}`}>
                        📝 Schichten
                    </button>
                    <button onClick={() => setView('reports')} className={`pb-2 px-2 font-bold ${view === 'reports' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-500'}`}>
                        📊 Berichte
                    </button>
                    <button onClick={() => setView('audit')} className={`pb-2 px-2 font-bold ${view === 'audit' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>
                        🛡️ Protokoll
                    </button>
                </div>
            </div>

            {/* FEEDBACK MELDUNG */}
            {successMsg && (
                <div className="no-print mb-6 bg-green-900/30 border border-green-500 text-green-400 px-4 py-3 rounded flex items-center animate-pulse print:hidden">
                    <span className="text-xl mr-2">✅</span>
                    <span className="font-bold">{successMsg}</span>
                </div>
            )}

            {/* DASHBOARD VIEW */}
            {view === 'dashboard' && (
                <div>
                    <div className="no-print bg-gray-900 p-6 rounded mb-8 border border-gray-800 print:hidden">
                        {/* Fahrer Management Row */}
                        <div className="flex flex-wrap gap-8 mb-8">
                            {/* Fahrer Add */}
                            <div className="flex-1 min-w-[300px]">
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Neuen Fahrer anlegen</h3>
                                <div className="flex gap-2 items-center bg-gray-950 p-3 rounded border border-gray-800">
                                    <input className="bg-gray-900 p-2 rounded text-white border border-gray-700 outline-none flex-1" placeholder="Name..." value={newDriverName} onChange={e => setNewDriverName(e.target.value)} />
                                    <button onClick={addDriver} className="text-green-500 border border-green-500 px-4 py-2 rounded font-bold hover:bg-green-900">+ Add</button>
                                </div>
                            </div>

                            {/* Fahrer Liste (Mini) */}
                            <div className="flex-1 min-w-[300px]">
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Fahrer verwalten ({drivers.length})</h3>
                                <div className="bg-gray-950 p-2 rounded border border-gray-800 max-h-[150px] overflow-y-auto custom-scrollbar">
                                    {drivers.length === 0 ? <p className="text-gray-600 text-sm p-2">Noch keine Fahrer.</p> : (
                                        <ul className="space-y-1">
                                            {drivers.map(d => (
                                                <li key={d.id} className="flex justify-between items-center bg-gray-900 px-3 py-2 rounded hover:bg-gray-800 group">
                                                    <span className="font-bold text-sm">👤 {d.name}</span>
                                                    <button
                                                        onClick={() => deleteDriver(d.id, d.name)}
                                                        className="text-red-500 opacity-0 group-hover:opacity-100 transition text-xs border border-red-900 hover:bg-red-900/50 px-2 py-1 rounded"
                                                        title="Fahrer löschen"
                                                    >
                                                        🗑️ Entfernen
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Formular */}
                        <h2 className="text-xl font-bold mb-4 text-green-500">Neuen Eintrag erstellen</h2>
                        <form onSubmit={saveShift} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-gray-500 text-xs font-bold mb-1">FAHRER</label>
                                <select className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} required>
                                    <option value="">-- Wählen --</option>
                                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-500 text-xs font-bold mb-1">DATUM</label>
                                <input type="date" className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={date} onChange={e => setDate(e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-gray-500 text-xs font-bold mb-1">START</label>
                                <select className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={startTime} onChange={e => setStartTime(e.target.value)}>
                                    {timeOptions.map(t => <option key={`s-${t}`} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-500 text-xs font-bold mb-1">ENDE</label>
                                <select className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={endTime} onChange={e => setEndTime(e.target.value)}>
                                    {timeOptions.map(t => <option key={`e-${t}`} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div className="col-span-full mt-4 bg-gray-800 p-4 rounded border border-gray-700 flex justify-between items-center">
                                <div>
                                    <span className="text-gray-400 text-xs font-bold block uppercase">Gesetzliche Pause (Auto)</span>
                                    <span className="text-yellow-500 text-2xl font-bold">{pause} Min</span>
                                </div>
                                <button className="bg-green-600 px-8 py-3 rounded font-bold hover:bg-green-500 text-white shadow-lg transform hover:scale-105 transition">
                                    Speichern ✅
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Tabelle */}
                    <div className="bg-white text-black p-8 rounded print-area shadow-xl">
                        <div className="flex justify-between mb-6 border-b pb-4">
                            <h2 className="font-bold text-2xl">Stunden-Protokoll</h2>
                            <button onClick={() => window.print()} className="no-print bg-gray-800 text-white px-4 py-2 rounded hover:bg-black print:hidden">🖨️ PDF Export</button>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="uppercase border-b-2 border-black text-xs font-bold">
                                <tr>
                                    <th className="py-2">Fahrer</th>
                                    <th className="py-2">Zeitraum</th>
                                    <th className="py-2 text-right">Pause</th>
                                    <th className="py-2 text-right">Netto</th>
                                    <th className="py-2 text-right no-print">Aktion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {shifts.length === 0 ? (
                                    <tr><td colSpan={5} className="py-8 text-center text-gray-500">Keine Einträge vorhanden.</td></tr>
                                ) : (
                                    shifts.map(s => (
                                        <tr key={s.id} className="hover:bg-gray-50">
                                            <td className="py-3 font-bold">{getDriverName(s.drivers)}</td>
                                            <td className="py-3">
                                                {new Date(s.start_time).toLocaleDateString('de-DE')} <span className="text-gray-400">|</span> {new Date(s.start_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - {new Date(s.end_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-3 text-right text-gray-500">{s.break_minutes}m</td>
                                            <td className="py-3 text-right font-bold text-green-700 text-lg">
                                                {calculateNetDuration(s.start_time, s.end_time, s.break_minutes)}
                                            </td>
                                            <td className="py-3 text-right no-print">
                                                <button
                                                    onClick={() => {
                                                        const dateStr = new Date(s.start_time).toLocaleDateString('de-DE');
                                                        const timeStart = new Date(s.start_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                                                        const timeEnd = new Date(s.end_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                                                        deleteShift(s.id, getDriverName(s.drivers), dateStr, `${timeStart} - ${timeEnd}`);
                                                    }}
                                                    className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 text-xs font-bold border border-red-200"
                                                >
                                                    Löschen
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* REPORTS VIEW */}
            {view === 'reports' && (
                <div className="bg-white text-black p-8 rounded min-h-[500px]">
                    {/* Print Header (Only visible on print) */}
                    <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
                        <h1 className="text-3xl font-bold">Stundenabrechnung</h1>
                        <p className="text-gray-600">
                            {reportDriver ? drivers.find(d => d.id === reportDriver)?.name : 'Alle Fahrer'} | {new Date(reportMonth).toLocaleString('de-DE', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    {/* Filters (Hidden on print) */}
                    <div className="no-print print:hidden bg-gray-100 p-6 rounded mb-8 flex flex-wrap gap-4 items-end border border-gray-200">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Fahrer</label>
                            <select
                                className="bg-white border border-gray-300 p-2 rounded w-48"
                                value={reportDriver}
                                onChange={e => setReportDriver(e.target.value)}
                            >
                                <option value="">-- Alle Fahrer --</option>
                                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Monat</label>
                            <select
                                className="bg-white border border-gray-300 p-2 rounded w-48"
                                value={reportMonth}
                                onChange={e => setReportMonth(e.target.value)}
                            >
                                {getMonthOptions().map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 text-right">
                            <button onClick={() => window.print()} className="bg-purple-600 text-white px-6 py-2 rounded font-bold hover:bg-purple-700 shadow-lg">
                                🖨️ Bericht Drucken
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-50 p-4 rounded border border-gray-200">
                            <span className="block text-gray-500 text-xs uppercase font-bold">Gesamtstunden</span>
                            <span className="block text-4xl font-bold text-purple-600">{reportSummary.totalHours.toFixed(2)} h</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded border border-gray-200">
                            <span className="block text-gray-500 text-xs uppercase font-bold">Gesamt Pausen</span>
                            <span className="block text-2xl font-bold text-gray-700">{reportSummary.totalBreaks} min</span>
                        </div>
                    </div>

                    {/* Report Table */}
                    <table className="w-full text-sm text-left">
                        <thead className="uppercase border-b-2 border-black text-xs font-bold">
                            <tr>
                                <th className="py-2">Datum</th>
                                <th className="py-2">Fahrer</th>
                                <th className="py-2">Uhrzeit</th>
                                <th className="py-2 text-right">Pause</th>
                                <th className="py-2 text-right">Stunden</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reportData.length === 0 ? (
                                <tr><td colSpan={5} className="py-8 text-center text-gray-500">Keine Daten für diesen Zeitraum.</td></tr>
                            ) : (
                                reportData.map(s => (
                                    <tr key={s.id}>
                                        <td className="py-3 font-mono">{new Date(s.start_time).toLocaleDateString('de-DE')}</td>
                                        <td className="py-3 font-bold">{getDriverName(s.drivers)}</td>
                                        <td className="py-3">
                                            {new Date(s.start_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - {new Date(s.end_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="py-3 text-right">{s.break_minutes} min</td>
                                        <td className="py-3 text-right font-bold">
                                            {calculateNetDuration(s.start_time, s.end_time, s.break_minutes)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* AUDIT LOG VIEW */}
            {view === 'audit' && (
                <div className="bg-gray-900 p-8 rounded border border-gray-800 no-print print:hidden">
                    <h2 className="text-blue-500 font-bold text-2xl mb-2">🛡️ Audit Log</h2>
                    <p className="text-gray-400 text-sm mb-6">Manipulationssicheres Protokoll aller Änderungen.</p>

                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="uppercase border-b border-gray-700 text-gray-500 text-xs">
                            <tr>
                                <th className="py-3">Zeitpunkt</th>
                                <th className="py-3">Aktion</th>
                                <th className="py-3">Tabelle</th>
                                <th className="py-3">Details (ID)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {auditLogs.map(l => (
                                <tr key={l.id} className="hover:bg-gray-800 transition">
                                    <td className="py-3 font-mono text-zinc-400">{new Date(l.created_at).toLocaleString('de-DE')}</td>
                                    <td className="py-3 font-bold text-white">
                                        <span className={`px-2 py-1 rounded text-xs ${l.operation === 'INSERT' ? 'bg-green-900 text-green-400' : l.operation === 'DELETE' ? 'bg-red-900 text-red-400' : 'bg-blue-900 text-blue-400'}`}>
                                            {l.operation || l.action}
                                        </span>
                                    </td>
                                    <td className="py-3">{l.table_name}</td>
                                    <td className="py-3 font-mono text-xs text-gray-500">{l.record_id || JSON.stringify(l.details)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}