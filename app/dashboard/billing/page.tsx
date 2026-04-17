import { createClientServer } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export default async function Billing() {
  const supabase = createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Billing Management</h1>
      <p className="text-gray-600">Manage your subscription and payment methods.</p>
    </div>
  );
}
