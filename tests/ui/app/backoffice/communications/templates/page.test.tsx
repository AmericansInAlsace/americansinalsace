import { render, screen } from '@testing-library/react';
import EmailTemplatesPage from '@/app/[locale]/backoffice/communications/templates/page';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';

// Mock prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    emailTemplate: {
      findMany: vi.fn(),
    },
  },
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('EmailTemplatesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render email templates list', async () => {
    const mockTemplates = [
      { id: 1, name: 'Welcome Email', slug: 'welcome', subject: 'Welcome to AIA' },
    ];

    vi.mocked(prisma.emailTemplate.findMany).mockResolvedValue(mockTemplates as any);

    const Result = await EmailTemplatesPage();
    render(Result);

    expect(screen.getByText('Email Templates')).toBeInTheDocument();
    expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    expect(screen.getByText('Subject: Welcome to AIA')).toBeInTheDocument();
    expect(screen.getByText('Edit Design & Content')).toBeInTheDocument();
  });
});
