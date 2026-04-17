import PricingTiers from '@/components/PricingTiers';

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          KimiClean Enterprise
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
          Premium cleaning services powered by 3D AR tours and AI-driven scheduling.
          Choose your plan and experience the future of facility management.
        </p>
        <PricingTiers />
      </section>
    </main>
  );
}
