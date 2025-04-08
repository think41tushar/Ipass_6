import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

const apiKey = process.env.NEXT_PUBLIC_GEMINI_KEY || "";

const genAI = new GoogleGenerativeAI(apiKey);

async function validateQuery(prompt: string): Promise<any> {
  const model = genAI.getGenerativeModel({
    model: "models/gemini-1.5-pro-latest",
  });

  const toolListPath = path.join(process.cwd(), "public", "toollist.txt");
  const toollist = fs.readFileSync(toolListPath, "utf-8");

  const result = await model.generateContent(`
    You are a prompt validation AI. You are reviewing user prompts before they are passed to an AI agent that can execute actions using a list of tools.

    The AI agent is capable of:
    - Executing complex tasks using these tools.
    - Generating content (like email subject/body, message content, summaries, etc.) when not explicitly provided.
    
    However, the agent has a known issue: **if a required argument like an email address or destination is missing**, it may make assumptions (like defaulting to rishi@example.com) instead of asking the user for clarification.
    
    Your job is to catch prompts that:
    - Are vague or incomplete in a way that would lead to incorrect or risky tool use.
    - Do not provide **critical input fields** like valid email addresses, phone numbers, usernames, chat spaces, etc. that **cannot be safely guessed**.
    - Mention people or entities (e.g., “send to Rishi”) without giving enough detail for the agent to identify them correctly.
    
    🚫 **IMPORTANT EXCEPTION**:
    If the prompt **only uses tools related to GChat or HubSpot**, then skip all validation. These tools are hardcoded, and the prompt will not contain their inputs explicitly.
    
    Examples:
    ✅ "Send a fun fact to rishi@gmail.com" – Valid, agent can generate content and a valid address is given.  
    ❌ "Send a fun fact to Rishi" – Invalid, no valid email or identifier.  
    ✅ "Email John with the latest report" (and John's email is provided) – Valid.  
    ❌ "Send a message to my team" – Invalid unless a team/chat space is defined.
    ✅ "Create a meeting for project brainstorming when i have free time tomorrow" – Valid, agent can see free times tomorrow and can create at anytime.
    ❌ "Create a meeting tomorrow" – Invalid, no subject or context about the meeting is given.
    
    You are provided with:
    1. A user prompt.
    2. A list of tools (each with the parameters it expects).
    
    You must check:
    - Whether **all critical parameters** required for these tools are present and unambiguous.
    - Whether the prompt can be **safely and accurately executed by the AI agent** without risky assumptions.
    
    Respond in **strict JSON only**, using this format:
    
    If valid:
    {
      "accepted": "yes",
      "reasons": []
    }
    
    If invalid:
    {
      "accepted": "no",
      "reasons": [
        "Clear, user-facing explanation of what is missing or vague."
      ]
    }
    
    Only respond with valid JSON. Do not wrap your response in code blocks.

    user prompt : ${prompt}
    tool list : ${toollist}
    `);
  const response = await result.response;
  let text = response.text().trim();

  // 👇 Remove code block markdown if present
  if (text.startsWith("```")) {
    text = text.replace(/```(?:json)?\n?/, "").replace(/```$/, "");
  }

  console.log("AI reponse: ", text);
  const jsonResponse = JSON.parse(text);
  return jsonResponse;
}

export { validateQuery };
