import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import ImprovementsPage from '@/app/[locale]/backoffice/improvements/page';
import * as actions from '@/app/actions/improvements';

vi.mock('@/app/actions/improvements', () => ({
  getImprovementCategories: vi.fn(),
}));

vi.mock('@/components/features/backoffice/ImprovementForm', () => ({
  default: () => <div data-testid="mock-improvement-form"></div>,
}));

describe('ImprovementsPage', () => {
  it('renders correctly', async () => {
    vi.mocked(actions.getImprovementCategories).mockResolvedValue([]);

    const Result = await ImprovementsPage();
    render(Result);

    expect(screen.getByText('Site Improvements')).toBeInTheDocument();
    expect(screen.getByTestId('mock-improvement-form')).toBeInTheDocument();
  });
});
