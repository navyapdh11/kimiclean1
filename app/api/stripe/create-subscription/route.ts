import { NextResponse } from 'next/server';
import { stripe, getOrCreateCustomer } from '@/lib/stripe';
import { createClient } from '@/lib/supabase';
import { z } from 'zod';

const schema = z.object({
  tierId: z.string(),
  userId: z.string().uuid(),
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tierId, userId, email } = schema.parse(body);

    const supabase = createClient();

    const { data: tier, error: tierError } = await supabase
      .from('subscription_tiers')
      .select('stripe_price_id, name')
      .eq('id', tierId)
      .single();

    if (tierError || !tier) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const customerId = await getOrCreateCustomer(userId, email);

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: tier.stripe_price_id }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: { userId, tierId },
    });

    const clientSecret = (subscription.latest_invoice as any).payment_intent?.client_secret;

    if (!clientSecret) {
      return NextResponse.json(
        { error: 'Failed to create payment intent' },
        { status: 500 }
      );
    }

    await supabase.from('subscriptions').upsert({
      user_id: userId,
      tier_id: tierId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    }, {
      onConflict: 'stripe_subscription_id',
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret,
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
