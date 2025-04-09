import type { NextApiRequest, NextApiResponse } from "next";
import { validateQuery } from "@/lib/validateQuery"; // Adjust if not using `baseUrl` in tsconfig

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await validateQuery(prompt);
    res.status(200).json(result);
  } catch (error) {
    console.error("Validation failed:", error);
    
    // Check if it's a rate limit error (429)
    if (error instanceof Error && error.message.includes("429 Too Many Requests")) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        message: "API rate limit reached. Your request will be processed without validation.",
        bypassValidation: true
      });
    }
    
    res.status(500).json({
      error: "Validation error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
