import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

export async function POST(req: Request) {
  const { message } = await req.json();

  const completion = await client.chat.completions.create({
    model: "nvidia/nemotron-3.5-lightning-30b-a3b",
    messages: [
      {
        role: "system",
        content: "You are the FITT AI Assistant. Answer questions about FITT, IIT Delhi, startups, innovation, incubation, research, and technology transfer.",
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