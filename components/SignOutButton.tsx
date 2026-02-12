'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <button
            onClick={handleSignOut}
            className="text-zinc-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
        >
            Sign Out
            <LogOut size={16} />
        </button>
    )
}
