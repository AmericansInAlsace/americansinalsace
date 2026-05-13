import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JiraService } from '@/services/JiraService';

describe('JiraService Integration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    process.env = {
      ...originalEnv,
      JIRA_USER_EMAIL: 'test@example.com',
      JIRA_API_TOKEN: 'token123',
      JIRA_HOST: 'test.atlassian.net',
      JIRA_PROJECT_KEY: 'TEST',
    };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = originalEnv;
  });

  it('should create a jira issue successfully', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ id: '10001', key: 'TEST-1' }),
    } as Response);

    const result = await JiraService.createIssue(
      'Test Summary',
      'Test Description',
      'Bug',
      { name: 'John Doe', email: 'john@example.com' }
    );

    expect(result.key).toBe('TEST-1');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://test.atlassian.net/rest/api/3/issue'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Basic'),
        }),
      })
    );
  });

  it('should throw error if JIRA API fails', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ errors: { summary: 'Summary is required' } }),
    } as Response);

    await expect(JiraService.createIssue('', '', '')).rejects.toThrow('Summary is required');
  });

  it('should throw error if config is missing', async () => {
    delete process.env.JIRA_HOST;
    await expect(JiraService.createIssue('s', 'd', 'c')).rejects.toThrow('JIRA_HOST or JIRA_PROJECT_KEY is not configured');
  });

  it('should throw error if auth config is missing', async () => {
    delete process.env.JIRA_API_TOKEN;
    await expect(JiraService.createIssue('s', 'd', 'c')).rejects.toThrow('JIRA_USER_EMAIL or JIRA_API_TOKEN is not configured');
  });
});
