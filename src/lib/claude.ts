import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateNoteInsights(content: string, title: string) {
  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Analyze this note and respond ONLY with a valid JSON object. No markdown, no backticks, no explanation. Just the raw JSON.

{
  "summary": "2-3 sentence summary",
  "action_items": ["item 1", "item 2", "item 3"],
  "suggested_title": "concise title"
}

Title: ${title}
Content: ${content}`,
      },
    ],
  });

  const text = (message.content[0] as { text: string }).text.trim();
  
  // Strip markdown if model adds it anyway
  const clean = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(clean);
}