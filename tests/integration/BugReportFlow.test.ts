import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitBugReport } from '@/app/actions/bugs';
import { getServerSession } from 'next-auth';

vi.mock('next-auth');

describe('Integration: Bug Report Flow', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.JIRA_USER_EMAIL = 'test@example.com';
    process.env.JIRA_API_TOKEN = 'test-token';
    process.env.JIRA_HOST = 'test.atlassian.net';
    process.env.JIRA_PROJECT_KEY = 'TEST';
    
    global.fetch = vi.fn();
    vi.mocked(getServerSession).mockResolvedValue(null);
  });

  it('should create a JIRA bug ticket when the form is submitted by a guest', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ key: 'BUG-101' }),
    } as Response);

    const result = await submitBugReport({
      subject: 'Critical: Site Down',
      description: 'The site is not loading.',
    });

    expect(result).toEqual({ success: true, jiraKey: 'BUG-101' });
    
    // Verify the API call structure
    expect(global.fetch).toHaveBeenCalledWith(
      'https://test.atlassian.net/rest/api/3/issue',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"name":"Bug"'),
      })
    );

    // Verify the description contains the summary
    expect(global.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        body: expect.stringContaining('The site is not loading.'),
      })
    );
  });

  it('should include logged-in user info in the JIRA ticket', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'Member User', email: 'member@test.com' },
    } as any);

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ key: 'BUG-102' }),
    } as Response);

    await submitBugReport({
      subject: 'Small UI Glitch',
      description: 'The logo is slightly off-center.',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        body: expect.stringContaining('Member User'),
      })
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        body: expect.stringContaining('member@test.com'),
      })
    );
  });
});
