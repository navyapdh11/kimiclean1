import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();

  try {
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .in('status', ['active', 'trialing']);

    for (const sub of subscriptions || []) {
      const stripeSub = await stripe.subscriptions.retrieve(
        sub.stripe_subscription_id
      );

      await supabase
        .from('subscriptions')
        .update({
          status: stripeSub.status,
          current_period_end: new Date(stripeSub.current_period_end * 1000),
          cancel_at_period_end: stripeSub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', sub.stripe_subscription_id);
    }

    return NextResponse.json({ synced: subscriptions?.length || 0 });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
