import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { vi, describe, it, expect } from 'vitest';

vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: any) => <div data-testid="session-provider">{children}</div>,
}));

describe('AuthProvider', () => {
  it('renders correctly', () => {
    render(
      <AuthProvider>
        <div data-testid="child" />
      </AuthProvider>
    );

    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
