import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitBugReport } from '@/app/actions/bugs';
import { JiraService } from '@/services/JiraService';
import { getServerSession } from 'next-auth';

vi.mock('next-auth');
vi.mock('@/services/JiraService');

describe('submitBugReport server action', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should successfully submit a bug report for a guest user', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(JiraService.createIssue).mockResolvedValue({ key: 'BUG-1' });

    const result = await submitBugReport({
      subject: 'Test Bug',
      description: 'Test Description',
    });

    expect(result).toEqual({ success: true, jiraKey: 'BUG-1' });
    expect(JiraService.createIssue).toHaveBeenCalledWith(
      'Test Bug',
      'Test Description',
      'Bug Report',
      { name: 'Guest User', email: 'guest@americansinalsace.com' },
      'Bug'
    );
  });

  it('should successfully submit a bug report for a logged in user', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'John Doe', email: 'john@example.com' },
    } as any);
    vi.mocked(JiraService.createIssue).mockResolvedValue({ key: 'BUG-2' });

    const result = await submitBugReport({
      subject: 'Logged User Bug',
      description: 'Logged User Description',
    });

    expect(result).toEqual({ success: true, jiraKey: 'BUG-2' });
    expect(JiraService.createIssue).toHaveBeenCalledWith(
      'Logged User Bug',
      'Logged User Description',
      'Bug Report',
      { name: 'John Doe', email: 'john@example.com' },
      'Bug'
    );
  });

  it('should throw error if JiraService fails', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(JiraService.createIssue).mockRejectedValue(new Error('JIRA Error'));

    await expect(submitBugReport({
      subject: 'Fail Bug',
      description: 'Fail Description',
    })).rejects.toThrow('JIRA Error');
  });
});
