"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi! I'm the FITT AI Assistant. Ask me anything about FITT, IIT Delhi, startups, technology transfer, incubation, or innovation.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply || "I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I couldn't connect to the AI right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col">
        <header className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold">
              F
            </div>

            <div>
              <h1 className="text-lg font-semibold">
                FITT AI Assistant
              </h1>
              <p className="text-sm text-slate-400">
                Foundation for Innovation & Technology Transfer
              </p>
            </div>
          </div>
        </header>

        <section className="flex flex-1 flex-col px-6 py-8">
          <div className="flex-1 space-y-6 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-2xl rounded-2xl px-5 py-4 ${
                    msg.role === "user"
                      ? "bg-blue-600"
                      : "border border-white/10 bg-white/5"
                  }`}
                >
                  <p className="text-sm leading-6 whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                  <p className="text-sm text-slate-400">
                    FITT AI is thinking...
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8">
            <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder="Ask something about FITT..."
                disabled={loading}
                className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-slate-500 disabled:opacity-50"
              />

              <button
                onClick={sendMessage}
                disabled={loading}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Thinking..." : "Send"}
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-slate-500">
              FITT AI Assistant • Powered by RAG
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}