'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut()
        } catch (error) {
            console.error('Error signing out:', error)
        } finally {
            localStorage.clear()
            sessionStorage.clear()
            // Force reload to clear any state
            window.location.href = '/'
        }
    }

    return (
        <button
            onClick={handleSignOut}
            className="text-gray-400 hover:text-red-400 transition-colors text-xs font-bold flex items-center gap-2 uppercase tracking-wide border border-gray-800 hover:border-red-900 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-red-950/30"
            title="Abmelden"
        >
            <span className="hidden sm:inline">Abmelden</span>
            <LogOut size={14} />
        </button>
    )
}
