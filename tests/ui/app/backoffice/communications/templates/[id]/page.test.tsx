import { render, screen } from '@testing-library/react';
import EditEmailTemplatePage from '@/app/[locale]/backoffice/communications/templates/[id]/page';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { vi, describe, it, expect, afterEach } from 'vitest';

vi.mock('@/lib/db', () => ({
  prisma: {
    emailTemplate: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND'); }),
}));

vi.mock('@/components/features/backoffice/TemplateEditorForm', () => ({
  TemplateEditorForm: () => <div data-testid="template-editor-form" />,
}));

describe('EditEmailTemplatePage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when template is found', async () => {
    vi.mocked(prisma.emailTemplate.findUnique).mockResolvedValue({
      id: 1,
      name: 'Welcome Email',
      slug: 'welcome-email',
      subject: 'Welcome',
      htmlContent: '',
      textContent: '',
    } as any);

    const params = Promise.resolve({ id: '1' });
    const Result = await EditEmailTemplatePage({ params: params as any });
    render(Result);

    expect(screen.getByText('Edit Template: Welcome Email')).toBeInTheDocument();
    expect(screen.getByTestId('template-editor-form')).toBeInTheDocument();
  });

  it('calls notFound when template is missing', async () => {
    vi.mocked(prisma.emailTemplate.findUnique).mockResolvedValue(null);

    const params = Promise.resolve({ id: '99' });
    
    await expect(EditEmailTemplatePage({ params: params as any })).rejects.toThrow('NEXT_NOT_FOUND');
    
    expect(notFound).toHaveBeenCalled();
  });
});
