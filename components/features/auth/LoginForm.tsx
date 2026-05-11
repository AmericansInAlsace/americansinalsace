'use client';

import React, { useState } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { useTranslations } from 'next-intl';

/**
 * A client-side form for user authentication.
 * 
 * @description Renders a login form using NextAuth's credentials provider.
 * @returns {JSX.Element} The rendered login form.
 */
export function LoginForm(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations('Auth');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Show the actual error message (e.g. "Please verify your email")
        setError(result.error);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('login')}</CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">{t('email')}</Label>
            <Input id="login-email" name="email" type="email" placeholder="john@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input id="password" name="password" type="password" required />
            <div className="flex justify-end">
              <Link 
                href="/forgot-password" 
                className="text-xs text-[var(--color-primary-blue)] hover:text-[var(--color-primary-red)] transition-colors focus:ring-2 focus:ring-[var(--color-primary-red)] rounded outline-none"
              >
                {t('forgotPassword')}
              </Link>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-sm text-red-600" role="alert">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" isLoading={isLoading}>
            {t('login')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
