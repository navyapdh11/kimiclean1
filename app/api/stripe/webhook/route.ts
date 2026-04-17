import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase';
import SubscriptionRenewalEmail from '@/emails/SubscriptionRenewal';

function getResendInstance() {
  const { Resend } = require('resend');
  return new Resend(process.env.RESEND_API_KEY || '');
}
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const processedEvents = new Set<string>();

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  if (processedEvents.has(event.id)) {
    return NextResponse.json({ received: true });
  }
  processedEvents.add(event.id);

  const supabase = createClient();

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_end: new Date((invoice.period_end || 0) * 1000),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', invoice.subscription);

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', invoice.subscription)
          .single();

        if (sub) {
          const { data: user } = await supabase.auth.admin.getUserById(sub.user_id);
          if (user.user?.email) {
            await getResendInstance().emails.send({
              from: `KimiClean <billing@kimiclean.com>`,
              to: user.user.email,
              subject: 'Your Subscription Renewed',
              react: SubscriptionRenewalEmail({
                periodEnd: new Date((invoice.period_end || 0) * 1000),
              }),
            });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', invoice.subscription);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
