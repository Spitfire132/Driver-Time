import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
        return new NextResponse('Missing environment variables', { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
        // @ts-ignore
        apiVersion: '2025-01-27.acacia',
        typescript: true,
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const amountTotal = session.amount_total;

        if (userId && amountTotal) {
            let newPlan = '';
            if (amountTotal === 1900) newPlan = 'basis';
            else if (amountTotal === 3900) newPlan = 'pro';
            else if (amountTotal === 7900) newPlan = 'premium';

            if (newPlan) {
                await supabase
                    .from('profiles')
                    .update({
                        subscription_plan: newPlan,
                        trial_ends_at: null // Testphase beenden
                    })
                    .eq('id', userId);
            }
        }
    }

    return new NextResponse('ok', { status: 200 });
}
