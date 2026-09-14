import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

function retrieveKnowledge(question: string, knowledge: string) {
  const chunks = knowledge
    .split(/\n(?=## )/)
    .filter((chunk) => chunk.trim().length > 0);

  const questionWords = question
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2);

  const ranked = chunks
    .map((chunk) => {
      const text = chunk.toLowerCase();

      const matches = questionWords.filter((word) =>
        text.includes(word)
      ).length;

      return {
        chunk,
        score: matches,
      };
    })
    .sort((a, b) => b.score - a.score);

  return ranked
    .slice(0, 3)
    .map((item) => item.chunk)
    .join("\n\n");
}

export async function POST(req: Request) {
  const { message } = await req.json();

  const knowledgePath = path.join(process.cwd(), "knowledge.md");
  const knowledge = fs.readFileSync(knowledgePath, "utf-8");

  const relevantKnowledge = retrieveKnowledge(message, knowledge);

  const completion = await client.chat.completions.create({
    model: "nvidia/nemotron-3.5-lightning-30b-a3b",
    max_tokens: 600,
    messages: [
      {
        role: "system",
        content: `You are the FITT AI Assistant.

Answer the user's question using ONLY the relevant FITT knowledge provided below.

Rules:
- Do not invent FITT-specific facts.
- If the answer is not available in the provided knowledge, say so.
- Give a clear, concise answer.

RELEVANT FITT KNOWLEDGE:
${relevantKnowledge}`,
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