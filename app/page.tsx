
import Link from 'next/link';
import { ArrowRight, CheckCircle, Clock, PieChart, ShieldCheck, Lock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 font-sans">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 p-6 flex justify-between items-center backdrop-blur-sm sticky top-0 z-50 bg-black/80">
        <div className="flex items-center gap-2">
          <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800">
            <Clock className="text-emerald-500" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">TimeNova</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="text-zinc-400 hover:text-white transition font-medium">Anmelden</Link>
          <Link href="/login" className="bg-white text-black px-4 py-2 rounded font-bold hover:bg-zinc-200 transition text-sm">
            Jetzt starten
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6 text-center max-w-4xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent pb-2">
          Deine Zeit.<br />Deine Regeln.
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          Die einfache Lösung für Zeiterfassung in jeder Branche.
          Egal ob Handwerk, Logistik, Büro oder Außendienst – behalte den Überblick.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/login" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-lg font-bold text-lg transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group">
            30 Tage kostenlos testen <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="#features" className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-8 py-4 rounded-lg font-bold text-lg border border-zinc-800 transition">
            Mehr erfahren
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 bg-zinc-950/50 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-white">Software für Profis.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 hover:border-zinc-600 transition group">
              <div className="mb-6 bg-zinc-950 w-12 h-12 flex items-center justify-center rounded-lg border border-zinc-800 group-hover:border-emerald-500/50 transition">
                <Clock className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Einfache Zeiterfassung</h3>
              <p className="text-zinc-400 leading-relaxed">
                Start, Stopp, Pause. Deine Mitarbeiter erfassen ihre Stunden in Sekunden – per App oder am PC. Automatische Pausenberechnung inklusive.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 hover:border-zinc-600 transition group">
              <div className="mb-6 bg-zinc-950 w-12 h-12 flex items-center justify-center rounded-lg border border-zinc-800 group-hover:border-purple-500/50 transition">
                <PieChart className="text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Transparente Berichte</h3>
              <p className="text-zinc-400 leading-relaxed">
                Behalte die Arbeitszeiten, Überstunden und Fehlzeiten im Blick. Erstelle PDF-Berichte mit einem Klick für deine Lohnbuchhaltung.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 hover:border-zinc-600 transition group">
              <div className="mb-6 bg-zinc-950 w-12 h-12 flex items-center justify-center rounded-lg border border-zinc-800 group-hover:border-blue-500/50 transition">
                <ShieldCheck className="text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Manipulationssicher</h3>
              <p className="text-zinc-400 leading-relaxed">
                Das integrierte Audit-Log protokolliert jede Änderung lückenlos. So hast du immer den Nachweis, wer wann was geändert hat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DSGVO Section */}
      <section className="py-20 px-6 bg-zinc-900 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-emerald-900/30 border border-emerald-900 text-emerald-400 px-4 py-2 rounded-full mb-6 font-bold text-sm">
              <Lock size={16} />
              Datenschutz First
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">100% DSGVO Konform.</h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-6">
              Wir nehmen Datensicherheit ernst. Deine Mitarbeiterdaten werden verschlüsselt auf deutschen Servern gespeichert und niemals an Dritte weitergegeben.
            </p>
            <ul className="space-y-3 text-zinc-300">
              <li className="flex items-center gap-3">
                <CheckCircle className="text-emerald-500 flex-shrink-0" size={20} />
                <span>Hosting in der EU (Paris)</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="text-emerald-500 flex-shrink-0" size={20} />
                <span>Verschlüsselte Datenübertragung (SSL/TLS)</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="text-emerald-500 flex-shrink-0" size={20} />
                <span>Recht auf "Vergessenwerden" (Löschfunktion)</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-black/50 p-12 rounded-full border border-zinc-800 relative">
              <ShieldCheck size={120} className="text-emerald-500" />
              <div className="absolute -bottom-4 -right-4 bg-zinc-800 p-4 rounded-xl border border-zinc-700 shadow-xl">
                <span className="font-bold text-white block">DSGVO</span>
                <span className="text-xs text-green-400">Compliant ✅</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Trust */}
      <section className="py-20 px-6 border-t border-zinc-900 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8 text-zinc-500">Vertraut von Unternehmen aus allen Branchen</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['Handwerk', 'Logistik', 'Dienstleistung', 'Gastronomie', 'Startups'].map((item) => (
              <div key={item} className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800 text-zinc-300 text-sm">
                <CheckCircle size={14} className="text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Wähle den passenden Tarif.</h2>
            <p className="text-zinc-400 text-lg">Keine versteckten Kosten. Upgrade jederzeit möglich.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* BASIS */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col h-full hover:border-zinc-700 transition">
              <h2 className="text-xl font-bold text-zinc-300 mb-2">Basis</h2>
              <div className="text-3xl font-bold mb-6">19€ <span className="text-sm text-zinc-500 font-normal">/ Monat</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle size={18} className="text-zinc-500" /> Max. 5 Mitarbeiter</li>
                <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle size={18} className="text-zinc-500" /> Manuelle Zeiterfassung</li>
                <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle size={18} className="text-zinc-500" /> GoBD Audit-Log</li>
                <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle size={18} className="text-zinc-500" /> Berichte & Filter</li>
              </ul>
              <a href="https://buy.stripe.com/cNi3cv40t6IS1f54kEebu00" className="w-full bg-white text-black py-3 rounded-lg font-bold text-center hover:bg-zinc-200 transition block">
                Jetzt starten
              </a>
            </div>

            {/* PRO */}
            <div className="bg-zinc-900 border-2 border-emerald-500 rounded-2xl p-8 flex flex-col h-full relative transform md:-translate-y-4 shadow-2xl shadow-emerald-900/20">
              <h2 className="text-xl font-bold text-emerald-400 mb-2">Pro</h2>
              <div className="text-4xl font-bold mb-6 text-white">39€ <span className="text-sm text-zinc-500 font-normal">/ Monat</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm"><CheckCircle size={18} className="text-emerald-500" /> <span className="font-bold text-white">Max. 20 Mitarbeiter</span></li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle size={18} className="text-emerald-500" /> 1-Klick Magic Links (App)</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle size={18} className="text-emerald-500" /> GoBD Audit-Log</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle size={18} className="text-emerald-500" /> Berichte & Filter</li>
              </ul>
              <a href="https://buy.stripe.com/bJe9AT40t1oy3ndg3mebu01" className="w-full bg-emerald-500 text-black py-3 rounded-lg font-bold text-center hover:bg-emerald-400 shadow-lg hover:shadow-emerald-500/25 transition block">
                30 Tage kostenlos testen
              </a>
            </div>

            {/* PREMIUM */}
            <div className="bg-zinc-900 border border-purple-900/50 rounded-2xl p-8 flex flex-col h-full hover:border-purple-500/50 transition">
              <h2 className="text-xl font-bold text-purple-400 mb-2">Premium</h2>
              <div className="text-3xl font-bold mb-6">79€ <span className="text-sm text-zinc-500 font-normal">/ Monat</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle size={18} className="text-purple-500" /> <span className="font-bold text-white">Unbegrenzte Mitarbeiter</span></li>
                <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle size={18} className="text-purple-500" /> Alle Pro-Funktionen</li>
                <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle size={18} className="text-purple-500" /> VIP Support</li>
              </ul>
              <a href="https://buy.stripe.com/28E5kD7cF6IS7DtaJ2ebu02" className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold text-center hover:bg-purple-500 shadow-lg hover:shadow-purple-500/25 transition block">
                Jetzt starten
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-zinc-600 text-sm border-t border-zinc-900">
        <p>&copy; {new Date().getFullYear()} TimeNova. Alle Rechte vorbehalten.</p>
      </footer>
    </div >
  );
}