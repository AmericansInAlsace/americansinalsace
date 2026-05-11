'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { JiraService } from '@/services/JiraService';

/**
 * Submits a bug report to JIRA.
 */
export async function submitBugReport(data: { subject: string; description: string }) {
  const session = await getServerSession(authOptions);

  try {
    const jiraResponse = await JiraService.createIssue(
      data.subject,
      data.description,
      'Bug Report',
      {
        name: session?.user?.name || 'Guest User',
        email: session?.user?.email || 'guest@americansinalsace.com',
      },
      'Bug'
    );

    return { success: true, jiraKey: jiraResponse.key };
  } catch (error: any) {
    console.error('Failed to submit bug report to JIRA:', error);
    throw new Error(error.message || 'Failed to create JIRA ticket');
  }
}
