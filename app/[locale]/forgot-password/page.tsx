import { ForgotPasswordForm } from '@/components/features/auth/ForgotPasswordForm';
import { Link } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';

export const metadata = {
  title: 'Forgot Password | Americans in Alsace',
  description: 'Request a password reset link for your account.',
};

/**
 * The page for users to request a password reset. It renders the `ForgotPasswordForm`.
 * @param {object} props - The component props.
 * @param {Promise<{locale: string}>} props.params - The route parameters containing the locale.
 */
export default async function ForgotPasswordPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <h1 className="text-center text-3xl font-bold text-[var(--color-text-main)] font-serif">
          Reset Your Password
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--color-text-muted)]">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-[var(--color-primary-blue)] hover:text-[var(--color-primary-red)] transition-colors">
            Go back to login
          </Link>
        </p>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
