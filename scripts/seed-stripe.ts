import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const tiers = [
  {
    id: 'starter',
    name: 'Starter Clean',
    description: '2 cleanings/month with basic 3D preview',
    price: 9900,
  },
  {
    id: 'pro',
    name: 'Pro Shine',
    description: '8 cleanings/month with full WebXR tours',
    price: 29900,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Kimi',
    description: 'Unlimited cleanings with custom 3D models',
    price: 99900,
  },
];

async function seedStripe() {
  for (const tier of tiers) {
    const product = await stripe.products.create({
      name: tier.name,
      description: tier.description,
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: tier.price,
      currency: 'aud',
      recurring: { interval: 'month' },
    });

    await supabase
      .from('subscription_tiers')
      .update({ stripe_price_id: price.id })
      .eq('id', tier.id);

    console.log(`Created ${tier.name}: ${price.id}`);
  }
}

seedStripe().catch(console.error);
