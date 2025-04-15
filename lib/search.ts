import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Please use POST.' });
  }

  const { userid, tenantid, query } = req.body;

  if (!userid || !tenantid || !query) {
    return res.status(400).json({
      error: 'Missing required parameters: userid, tenantid, and query are required'
    });
  }

  try {
    // Here you would implement your actual search logic
    // For now, we'll return a mock response
    const response = {
      message: `Search results for "${query}":\n\n1. Google Drive Files:\n- Document 1.pdf\n- Report 2023.docx\n\n2. Emails:\n- Subject: Meeting Notes\n- From: team@example.com\n- Date: 2024-04-14\n\n3. Calendar Events:\n- Title: Team Meeting\n- Date: 2024-04-15\n- Time: 10:00 AM\n\n4. Hubspot Notes:\n- Title: Client Meeting Summary\n- Snippet: Discussed project timeline and deliverables`
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error processing search:', error);
    return res.status(500).json({
      error: 'Internal server error while processing search'
    });
  }
}
