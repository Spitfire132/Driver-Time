'use client'

import { LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
    const router = useRouter()
    const supabase = createClient()

    async function handleSignOut() {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <button
            onClick={handleSignOut}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-sm font-medium bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg"
            title="Sign Out"
        >
            <LogOut size={16} />
            Sign Out
        </button>
    )
}
