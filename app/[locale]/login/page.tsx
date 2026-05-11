import { LoginForm } from '@/components/features/auth/LoginForm';
import { Link } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';

export const metadata = {
  title: 'Member Login | Americans in Alsace',
  description: 'Log in to your account to access members-only content and events.',
};

/**
 * The user login page. It renders the `LoginForm` component.
 * @param {object} props - The component props.
 * @param {Promise<{locale: string}>} props.params - The route parameters containing the locale.
 */
export default async function LoginPage({
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
          Welcome Back
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--color-text-muted)]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-[var(--color-primary-red)] hover:text-[var(--color-primary-blue)] transition-colors">
            Join the community
          </Link>
        </p>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
