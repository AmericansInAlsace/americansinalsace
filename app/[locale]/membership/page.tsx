'use client';

import React, { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';
import { formatCurrency } from '@/lib/formatters';

interface Tier {
  id: number;
  name: string;
  description: string;
  price: number;
  paypalPlanId: string;
}

/**
 * The main membership selection page. It fetches available membership tiers
 * and displays them. For authenticated users, it provides PayPal buttons
 * to purchase a subscription.
 */
export default function MembershipPage() {
  const { data: session, status } = useSession();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchTiers() {
      const res = await fetch('/api/membership/tiers');
      const data = await res.json();
      setTiers(data.tiers || []);
      if (data.tiers?.length > 0) {
        setSelectedTier(data.tiers[0]);
      }
    }
    fetchTiers();
  }, []);

  const handleMockPayment = async () => {
    if (!selectedTier || !session?.user) return;
    
    const userId = (session.user as any).id;
    const tierId = selectedTier.id;

    const payload = {
      event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
      resource: {
        id: `MOCK-${Date.now()}`,
        custom_id: `${userId}|${tierId}`,
        start_time: new Date().toISOString(),
      },
      mock: true, // Flag to bypass signature verification in non-prod
    };

    try {
      const res = await fetch('/api/webhooks/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Mock Payment Successful! Your membership is being activated.');
        router.push('/profile');
      } else {
        alert('Mock Payment Failed.');
      }
    } catch (error) {
      console.error('Mock payment error:', error);
      alert('Error triggering mock payment.');
    }
  };

  if (status === 'loading') return <div className="p-12 text-center">Loading...</div>;

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h1 className="text-3xl font-bold mb-6 font-serif">Join Americans <span className="whitespace-nowrap">in Alsace</span></h1>
        <p className="text-lg text-gray-600 mb-8">Please log in or create an account to select a membership tier.</p>
        <button onClick={() => router.push('/login')} className="bg-[var(--color-primary-blue)] text-white px-6 py-2 rounded-md">Go to Login</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text-main)] font-serif mb-4">
            Become a Member
          </h1>
          <p className="text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">
            Support our community and enjoy full access to all events and resources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {tiers.map((tier) => (
            <div 
              key={tier.id}
              onClick={() => setSelectedTier(tier)}
              className={`cursor-pointer rounded-2xl p-8 border-2 transition-all shadow-sm flex flex-col h-full ${
                selectedTier?.id === tier.id 
                  ? 'border-[var(--color-primary-red)] bg-white ring-4 ring-red-50 scale-105' 
                  : 'border-[var(--color-border)] bg-white hover:border-gray-300'
              }`}
            >
              <h3 className="text-xl font-bold mb-2 font-serif">{tier.name}</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-6 flex-grow">{tier.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[var(--color-primary-blue)]">{formatCurrency(tier.price)}</span>
                <span className="text-sm text-gray-500"> / year</span>
              </div>
              {selectedTier?.id === tier.id && (
                <div className="text-[var(--color-primary-red)] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-primary-red)]"></span> Selected
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedTier && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-[var(--color-border)] shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-6 font-serif">Complete Your Registration</h2>
            <p className="text-sm text-gray-600 mb-8">
              You are subscribing to the <span className="font-bold">{selectedTier.name}</span> tier for {formatCurrency(selectedTier.price)} per year.
            </p>

            {process.env.NODE_ENV !== 'production' && (
              <button 
                onClick={handleMockPayment}
                className="w-full mb-6 py-3 px-4 border-2 border-dashed border-[var(--color-primary-blue)] rounded-xl text-[var(--color-primary-blue)] hover:bg-blue-50 transition-colors font-bold text-sm"
              >
                🛠️ Dev Only: Mock Payment Success
              </button>
            )}
            
            <PayPalScriptProvider options={{ 
              "clientId": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
              "intent": "subscription",
              "vault": true
            }}>
              <PayPalButtons 
                style={{ layout: 'vertical', shape: 'rect' }}
                createSubscription={(data, actions) => {
                  return actions.subscription.create({
                    plan_id: selectedTier.paypalPlanId || '', // In production, this would be a real plan ID
                    custom_id: `${(session?.user as any)?.id || '0'}|${selectedTier.id}`
                  });
                }}
                onApprove={async (data, actions) => {
                  alert('Thank you for your membership! Your account will be activated shortly.');
                  router.push('/profile');
                }}
              />
            </PayPalScriptProvider>
          </div>
        )}
      </main>
    </div>
  );
}
