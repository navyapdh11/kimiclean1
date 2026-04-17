import { createClientServer } from '@/lib/supabase';
import SubscriptionCard from './SubscriptionCard';

export default async function PricingTiers() {
  const supabase = createClientServer();
  
  const { data: tiers } = await supabase
    .from('subscription_tiers')
    .select('*')
    .order('monthly_price', { ascending: true });

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
      {tiers?.map((tier) => (
        <SubscriptionCard
          key={tier.id}
          tier={tier}
          userId={user?.id || ''}
          email={user?.email || ''}
        />
      ))}
    </div>
  );
}
