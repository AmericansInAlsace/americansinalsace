import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { AuthService } from '@/services/AuthService';
import { MembershipService } from '@/services/MembershipService';
import { SponsorshipService } from '@/services/SponsorshipService';
import { ProfileForm } from '@/components/features/profile/ProfileForm';
import SponsorProfileForm from '@/components/features/profile/SponsorProfileForm';

/**
 * User Profile Page.
 * 
 * @description Displays and allows editing of user profile information.
 * Protected by NextAuth session check.
 * 
 * @param {Object} props - Component props.
 * @param {Promise<{ locale: string }>} props.params - Dynamic route parameters.
 */
export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/');
    return null;
  }

  const user = await AuthService.getUserByEmail(session.user.email);

  if (!user) {
    redirect('/');
    return null;
  }

  const subscription = await MembershipService.getUserSubscription(user.id);
  const activeSponsorship = await SponsorshipService.getActiveSponsorship(user.id);
  const sponsorProfile = activeSponsorship ? await SponsorshipService.getSponsorProfile(user.id) : null;

  /**
   * Formats a date for display.
   * @param {Date | null | undefined} date - The date to format.
   * @returns {string} The formatted date string.
   */
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-12">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-[var(--color-text-main)] font-serif">
              Member Profile
            </h1>
            <p className="text-[var(--color-text-muted)] mt-2">
              Manage your personal information and community presence.
            </p>
          </div>
          {subscription ? (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <div>
                <p className="text-xs font-bold text-green-800 uppercase tracking-tighter">Active Member</p>
                <p className="text-sm font-medium text-green-700">{subscription.tier.name}</p>
              </div>
            </div>
          ) : (
            <Link 
              href="/membership" 
              className="bg-[var(--color-primary-red)] text-white px-6 py-2 rounded-md font-bold hover:opacity-90 transition-opacity shadow-md text-center"
            >
              Get Membership
            </Link>
          )}
          {activeSponsorship && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
              <div>
                <p className="text-xs font-bold text-blue-800 uppercase tracking-tighter">Active Sponsor</p>
                <p className="text-sm font-medium text-blue-700">{activeSponsorship.tier.name}</p>
              </div>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* Membership Status Card */}
          {subscription && (
            <div className="bg-white shadow-sm rounded-lg border border-[var(--color-border)] p-8">
              <h2 className="text-xl font-bold mb-4 font-serif text-[var(--color-primary-blue)] border-b pb-2">Membership Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <p className="font-semibold text-green-600 capitalize">{subscription.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Member Since</p>
                  <p className="font-semibold">{formatDate(subscription.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Renewal Date</p>
                  <p className="font-semibold">{formatDate(subscription.endDate)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sponsor Profile Section */}
          {activeSponsorship && (
            <div className="bg-white shadow-sm rounded-lg border border-[var(--color-border)] p-8">
              <SponsorProfileForm initialProfile={sponsorProfile} />
            </div>
          )}

          <div className="bg-white shadow-sm rounded-lg border border-[var(--color-border)] overflow-hidden">
            <div className="p-8">
              <ProfileForm user={{
                ...user,
                id: user.id.toString()
              }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
