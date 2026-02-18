'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/login?error=Could not authenticate user')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data: {
                first_name: formData.get('first_name') as string,
                last_name: formData.get('last_name') as string,
                company_name: formData.get('company_name') as string,
            }
        }
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        redirect('/login?error=Could not create user: ' + error.message)
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
