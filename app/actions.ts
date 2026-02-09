'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addTimeEntry(formData: FormData) {
    const supabase = await createClient()

    const data = {
        driver_name: formData.get('driver_name') as string,
        work_date: formData.get('work_date') as string,
        target_hours: parseFloat(formData.get('target_hours') as string),
        actual_hours: parseFloat(formData.get('actual_hours') as string),
    }

    const { error } = await supabase.from('time_entries').insert(data)

    if (error) {
        console.error('Error adding time entry:', error)
        throw new Error('Failed to add time entry')
    }

    revalidatePath('/')
}

export async function getEntries() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('work_date', { ascending: false })

    if (error) {
        console.error('Error fetching time entries:', error)
        return []
    }

    return data
}

export async function getDriverStats() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('time_entries')
        .select('driver_name, target_hours, actual_hours')

    if (error) {
        console.error('Error fetching driver stats:', error)
        return []
    }

    // Aggregate data by driver
    const statsMap = new Map<string, {
        driver_name: string
        total_target: number
        total_actual: number
        balance: number
    }>()

    data.forEach((entry) => {
        const current = statsMap.get(entry.driver_name) || {
            driver_name: entry.driver_name,
            total_target: 0,
            total_actual: 0,
            balance: 0,
        }

        const target = Number(entry.target_hours)
        const actual = Number(entry.actual_hours)

        current.total_target += target
        current.total_actual += actual
        current.balance += (actual - target)

        statsMap.set(entry.driver_name, current)
    })

    // Convert to array and sort by balance (descending)
    return Array.from(statsMap.values()).sort((a, b) => b.balance - a.balance)
}

export async function deleteEntry(formData: FormData) {
    const supabase = await createClient()
    const id = formData.get('id') as string

    if (!id) {
        throw new Error('ID is required to delete an entry')
    }

    const { error } = await supabase.from('time_entries').delete().eq('id', id)

    if (error) {
        console.error('Error deleting time entry:', error)
        throw new Error('Failed to delete time entry')
    }

    revalidatePath('/')
}
