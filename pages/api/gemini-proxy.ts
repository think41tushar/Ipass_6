// API route that proxies requests to the Gemini API
import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Get the API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_KEY || "";
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log('Proxy received prompt, sending to Gemini API');

    // Log the prompt length for debugging
    console.log(`Prompt length: ${prompt.length} characters`);
    
    // Construct the payload for the Gemini API
    const payload = {
      contents: [{ 
        role: 'user',
        parts: [{ text: prompt }] 
      }],
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    };
    
    // Log the API endpoint we're calling
    const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    console.log(`Calling Gemini API at: ${apiEndpoint.split('?')[0]}`);
    
    // Make the API request
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Handle error responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error (${response.status}):`, errorText);
      
      // Return a more detailed error response
      return res.status(response.status).json({ 
        error: {
          status: response.status,
          message: `Gemini API error: ${response.status}`,
          details: errorText
        }
      });
    }

    // Parse and log the response
    const data = await response.json();
    
    // Check if we have a valid response with candidates
    if (data.candidates && data.candidates.length > 0) {
      console.log('Received valid response from Gemini API');
      
      // Log the first few characters of the response text for debugging
      if (data.candidates[0].content?.parts?.[0]?.text) {
        const text = data.candidates[0].content.parts[0].text;
        console.log(`Response text (first 100 chars): ${text.substring(0, 100)}...`);
      }
    } else {
      console.warn('Received response without candidates:', JSON.stringify(data, null, 2));
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in Gemini proxy:', error);
    return res.status(500).json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
