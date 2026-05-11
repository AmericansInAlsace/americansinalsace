import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JiraService } from '@/services/JiraService';

describe('JiraService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.JIRA_USER_EMAIL = 'test@example.com';
    process.env.JIRA_API_TOKEN = 'test-token';
    process.env.JIRA_HOST = 'test.atlassian.net';
    process.env.JIRA_PROJECT_KEY = 'TEST';
    
    global.fetch = vi.fn();
  });

  describe('createIssue', () => {
    it('should successfully create a JIRA issue with default issue type', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ key: 'TEST-123' }),
      } as Response);

      const result = await JiraService.createIssue('Test Summary', 'Test Desc', 'Bug');

      expect(result.key).toBe('TEST-123');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.atlassian.net/rest/api/3/issue',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"name":"Story"'),
        })
      );
    });

    it('should successfully create a JIRA issue with custom issue type', async () => {
      process.env.JIRA_ISSUE_TYPE = 'Bug';
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ key: 'TEST-456' }),
      } as Response);

      await JiraService.createIssue('Bug Summary', 'Bug Desc', 'UI', { name: 'User', email: 'user@test.com' });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.atlassian.net/rest/api/3/issue',
        expect.objectContaining({
          body: expect.stringContaining('"name":"Bug"'),
        })
      );
    });

    it('should successfully create a JIRA issue with provided issueType parameter', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ key: 'TEST-789' }),
      } as Response);

      await JiraService.createIssue('Bug Report', 'Broken button', 'Bug', { name: 'Guest', email: 'guest@test.com' }, 'Bug');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.atlassian.net/rest/api/3/issue',
        expect.objectContaining({
          body: expect.stringContaining('"name":"Bug"'),
        })
      );
    });

    it('should throw error if JIRA configuration is missing', async () => {
      delete process.env.JIRA_HOST;
      await expect(JiraService.createIssue('S', 'D', 'C')).rejects.toThrow('JIRA_HOST or JIRA_PROJECT_KEY is not configured');
    });

    it('should throw error if JIRA API returns non-ok status', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        json: async () => ({ errors: { summary: 'Summary is required' } }),
      } as Response);

      await expect(JiraService.createIssue('', 'D', 'C')).rejects.toThrow('Summary is required');
    });

    it('should throw generic error if JIRA API returns non-ok status without errors object', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Bad Request' }),
      } as Response);

      await expect(JiraService.createIssue('S', 'D', 'C')).rejects.toThrow('Failed to create JIRA issue');
    });
  });
});
