import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

export async function POST(req: Request) {
  const { message } = await req.json();

  const knowledgePath = path.join(process.cwd(), "knowledge.md");
  const knowledge = fs.readFileSync(knowledgePath, "utf-8");

  const completion = await client.chat.completions.create({
    model: "nvidia/nemotron-3.5-lightning-30b-a3b",
    messages: [
      {
        role: "system",
        content: `You are the FITT AI Assistant.

Answer the user's question using the FITT knowledge base below.

IMPORTANT:
- Use the knowledge base as your primary source.
- Do not invent FITT-specific facts.
- If the answer is not available in the knowledge base, say that the information is not available in the current FITT knowledge base.

FITT KNOWLEDGE BASE:
${knowledge}`,
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return NextResponse.json({
    reply: completion.choices[0].message.content,
  });
}