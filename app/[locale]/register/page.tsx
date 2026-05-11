import { RegisterForm } from '@/components/features/auth/RegisterForm';
import { Link } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';

export const metadata = {
  title: 'Join the Community | Americans in Alsace',
  description: 'Create your account to connect with fellow expats in Alsace.',
};

/**
 * The new user registration page. It renders the `RegisterForm` component.
 * @param {object} props - The component props.
 * @param {Promise<{locale: string}>} props.params - The route parameters containing the locale.
 */
export default async function RegisterPage({
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
          Create an Account
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--color-text-muted)]">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[var(--color-primary-blue)] hover:text-[var(--color-primary-red)] transition-colors">
            Log in here
          </Link>
        </p>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}
