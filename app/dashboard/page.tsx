import { createClientServer } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const supabase = createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, subscription_tiers(*)')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="bg-white/80 backdrop-blur rounded-xl p-6 border">
        <h2 className="text-xl font-semibold mb-4">Subscription Status</h2>
        {subscription ? (
          <div className="space-y-2">
            <p>Plan: <strong>{subscription.subscription_tiers?.name}</strong></p>
            <p>Status: <span className="capitalize">{subscription.status}</span></p>
            <p>Current period ends: {new Date(subscription.current_period_end).toLocaleDateString()}</p>
          </div>
        ) : (
          <p>No active subscription. <a href="/#pricing" className="text-blue-600">View plans</a></p>
        )}
      </div>
    </div>
  );
}
