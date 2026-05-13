import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import SponsorsPage from '@/app/[locale]/sponsors/page';
import { SponsorshipService } from '@/services/SponsorshipService';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue(
    Object.assign(
      (key: string, values?: any) => {
        if (key === 'sponsorBadge' && values?.tier) return `Sponsor ${values.tier}`;
        return key;
      },
      {
        rich: (key: string, options: any) => {
          if (options?.span) return options.span('Mocked Title');
          return key;
        },
      }
    )
  ),
}));

vi.mock('@/services/SponsorshipService', () => ({
  SponsorshipService: {
    getAllActiveSponsors: vi.fn(),
  },
}));

describe('SponsorsPage', () => {
  it('renders correctly with sponsors', async () => {
    vi.mocked(SponsorshipService.getAllActiveSponsors).mockResolvedValue([
      {
        id: 1,
        companyName: 'Acme Corp',
        tierName: 'Gold',
        bio: 'A cool company',
        logoUrl: '',
        websiteUrl: 'https://acme.com',
      } as any,
    ]);

    const Result = await SponsorsPage();
    render(Result);

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('A cool company')).toBeInTheDocument();
    expect(screen.getByText('Sponsor Gold')).toBeInTheDocument();
  });

  it('renders empty state', async () => {
    vi.mocked(SponsorshipService.getAllActiveSponsors).mockResolvedValue([]);

    const Result = await SponsorsPage();
    render(Result);

    expect(screen.getByText('noSponsors')).toBeInTheDocument();
  });
});
