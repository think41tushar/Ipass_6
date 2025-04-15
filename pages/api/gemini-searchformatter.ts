// pages/api/gemini-searchformatter.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || '');

interface FormattedSearchResult {
  googleDrive: { fileName: string; fileType: string } | null;
  emails: Array<{ subject: string; from: string; date: string; body: string }>;
  calendarEvents: Array<{ title: string; date: string; time: string; description?: string }>;
  hubspot: Array<{ title: string; snippet: string }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FormattedSearchResult | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Please use POST.' });
  }

  const { rawSearchResult } = req.body;

  if (!rawSearchResult || typeof rawSearchResult !== 'string') {
    return res.status(400).json({
      error: 'Missing or invalid rawSearchResult in the request body. It should be a string.',
    });
  }

  if (!genAI.apiKey) {
    return res.status(500).json({
      error: 'GEMINI_KEY environment variable is not set. Please configure it in your .env file.',
    });
  }

  console.log('Received search request with rawSearchResult:', rawSearchResult);

  try {
    console.log('Initializing Gemini model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are an expert information extraction and structured data formatting assistant. Your primary goal is to meticulously analyze a raw search result and organize the identified information into a JSON object with specific categories: 'googleDrive', 'emails', 'calendarEvents', and 'hubspot'.

    **Pre-Prompt Instructions:**

    -   **Be Explicit:** Clearly state in your JSON response whether information was found for each category. For example, if no emails are found, the 'emails' array should be empty (\`[]\`). If no Google Drive file is found, the 'googleDrive' object should be \`null\`.
    -   **Prioritize Accuracy:** Ensure the extracted data accurately reflects the content of the input text. Avoid making assumptions or fabricating information.
    -   **Handle Ambiguity:** If the input text contains ambiguous information, make your best judgment based on common patterns. If unsure, it's better to leave the corresponding field empty or as \`null\` rather than providing potentially incorrect data.
    -   **Strict JSON Output:** Your entire response MUST be a valid JSON object that strictly adheres to the 'Output Format' specified below. Do not include any preamble or explanatory text outside the JSON structure.

    **Input Text:**
    """
    ${rawSearchResult}
    """

    **Instructions:**

    Analyze the text provided above and identify information related to the following categories.

    1.  **Google Drive:**
        -   Identify mentions of 'Google Drive', 'File:', 'document', 'drive', or similar terms indicating file information.
        -   If a file is found, extract the 'File:' name and its 'Type:' (if explicitly mentioned).
        -   If no Google Drive file information is found, the 'googleDrive' field in the output MUST be \`null\`.

    2.  **Emails:**
        -   Look for sections or lines that represent emails, typically containing 'Subject:', 'From:', 'Date:', and a body of text.
        -   For each identified email, extract the 'Subject', 'From', 'Date', and the main 'Body'.
        -   Return an array of email objects. If no emails are found, the 'emails' field in the output MUST be an empty array (\`[]\`).

    3.  **Calendar Events:**
        -   Identify mentions of 'Calendar Events:', 'Event:', 'Title:', 'Date:', 'Time:', 'Meeting', or similar terms indicating scheduled events.
        -   For each event, extract the 'Title' (from 'Event:' or 'Title:'), 'Date', 'Time', and 'Description' (if available).
        -   Return an array of calendar event objects. If no calendar events are found, the 'calendarEvents' field in the output MUST be an empty array (\`[]\`).

    4.  **Hubspot Notes:**
        -   Look for sections related to Hubspot notes, often indicated by phrases like 'HubSpot Summaries:', 'HubSpot Notes:', 'Title:', 'Summary:'.
        -   For each Hubspot note, extract the 'Title' and the 'Snippet' or 'Summary'.
        -   Return an array of Hubspot note objects. If no Hubspot notes are found, the 'hubspot' field in the output MUST be an empty array (\`[]\`).

    **Output Format:**

    \`\`\`json
    {
      "googleDrive": { "fileName": "...", "fileType": "..." } | null,
      "emails": [
        { "subject": "...", "from": "...", "date": "...", "body": "..." },
        // ... more emails
      ],
      "calendarEvents": [
        { "title": "...", "date": "...", "time": "...", "description": "..." },
        // ... more events
      ],
      "hubspot": [
        { "title": "Hubspot Summary", "snippet": "..." },
        // ... more hubspot notes
      ]
    }
    \`\`\`

    Adhere strictly to the JSON output format. If a category has no information, represent it as specified in the instructions.`;

    console.log('Sending prompt to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    console.log('Received raw response from Gemini:', text);

    // If the response isn't already in JSON format, wrap it in the expected structure
    const formattedResult = text.startsWith('{') && text.endsWith('}') 
      ? JSON.parse(text)
      : {
          googleDrive: null,
          emails: [],
          calendarEvents: [],
          hubspot: []
        };

    console.log('Sending formatted result to frontend:', formattedResult);
    res.status(200).json(formattedResult);
  } catch (error: any) {
    console.error('Error generating content with Gemini:', error);
    res.status(500).json({
      error: `Failed to process the search result with Gemini: ${error.message}`,
    });
  }
}