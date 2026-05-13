import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitBugReport } from '@/app/actions/bugs';
import { JiraService } from '@/services/JiraService';
import { getServerSession } from 'next-auth';

vi.mock('next-auth');
vi.mock('@/services/JiraService', () => ({
  JiraService: {
    createIssue: vi.fn(),
  },
}));

describe('Integration: Bug Report Actions', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it('should successfully submit a bug report to JIRA', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ 
      user: { name: 'Test User', email: 'test@example.com' } 
    } as any);

    vi.mocked(JiraService.createIssue).mockResolvedValue({ key: 'AIA-123' } as any);

    const result = await submitBugReport({
      subject: 'Test Bug',
      description: 'Something is broken',
    });

    expect(result.success).toBe(true);
    expect(result.jiraKey).toBe('AIA-123');
    expect(JiraService.createIssue).toHaveBeenCalledWith(
      'Test Bug',
      'Something is broken',
      'Bug Report',
      { name: 'Test User', email: 'test@example.com' },
      'Bug'
    );
  });

  it('should successfully submit a bug report as Guest User if unauthenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(JiraService.createIssue).mockResolvedValue({ key: 'AIA-456' } as any);

    const result = await submitBugReport({
      subject: 'Guest Bug',
      description: 'Broken as guest',
    });

    expect(result.success).toBe(true);
    expect(result.jiraKey).toBe('AIA-456');
    expect(JiraService.createIssue).toHaveBeenCalledWith(
      'Guest Bug',
      'Broken as guest',
      'Bug Report',
      { name: 'Guest User', email: 'guest@americansinalsace.com' },
      'Bug'
    );
  });

  it('should handle JIRA submission errors', async () => {
    vi.mocked(JiraService.createIssue).mockRejectedValue(new Error('JIRA Down'));

    await expect(submitBugReport({
      subject: 'Test Bug',
      description: 'Desc',
    })).rejects.toThrow('JIRA Down');
  });
});
