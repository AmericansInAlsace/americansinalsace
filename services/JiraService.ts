/**
 * JiraService handles integration with the JIRA REST API v3.
 */
export class JiraService {
  /**
   * Generates the Basic Auth header for JIRA API calls.
   * @private
   */
  private static get authHeader(): string {
    const email = process.env.JIRA_USER_EMAIL;
    const token = process.env.JIRA_API_TOKEN;
    
    if (!email || !token) {
      throw new Error('JIRA_USER_EMAIL or JIRA_API_TOKEN is not configured');
    }

    return `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;
  }

  /**
   * Creates a new issue in JIRA.
   * @param {string} summary - The summary/subject of the issue.
   * @param {string} description - The detailed description.
   * @param {string} category - The category of the improvement.
   * @param {object} reporter - The user who reported the improvement.
   * @returns {Promise<any>} The response from JIRA.
   */
  static async createIssue(
    summary: string, 
    description: string, 
    category: string,
    reporter?: { name: string; email: string }
  ): Promise<any> {
    const host = process.env.JIRA_HOST;
    const projectKey = process.env.JIRA_PROJECT_KEY;

    if (!host || !projectKey) {
      throw new Error('JIRA_HOST or JIRA_PROJECT_KEY is not configured');
    }

    const bodyData = {
      fields: {
        project: {
          key: projectKey,
        },
        summary: summary,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'heading',
              attrs: { level: 3 },
              content: [{ type: 'text', text: '📝 USER FEEDBACK' }]
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: description }]
            },
            { type: 'rule' },
            {
              type: 'heading',
              attrs: { level: 3 },
              content: [{ type: 'text', text: '👤 REPORTER INFO' }]
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [{
                    type: 'paragraph',
                    content: [
                      { type: 'text', text: 'Name: ', marks: [{ type: 'strong' }] },
                      { type: 'text', text: reporter?.name || 'Unknown' }
                    ]
                  }]
                },
                {
                  type: 'listItem',
                  content: [{
                    type: 'paragraph',
                    content: [
                      { type: 'text', text: 'Email: ', marks: [{ type: 'strong' }] },
                      { type: 'text', text: reporter?.email || 'N/A' }
                    ]
                  }]
                },
                {
                  type: 'listItem',
                  content: [{
                    type: 'paragraph',
                    content: [
                      { type: 'text', text: 'Submitted At: ', marks: [{ type: 'strong' }] },
                      { type: 'text', text: new Date().toLocaleString() }
                    ]
                  }]
                }
              ]
            }
          ],
        },
        labels: [category.replace(/\s+/g, '_')],
        issuetype: {
          name: 'Story',
        },
      },
    };

    const response = await fetch(`https://${host}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('JIRA API Error:', data);
      throw new Error(data.errors ? Object.values(data.errors).join(', ') : 'Failed to create JIRA issue');
    }

    return data;
  }
}
