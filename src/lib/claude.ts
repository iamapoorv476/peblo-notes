import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateNoteInsights(content: string, title: string) {
  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Analyze this note and respond ONLY with valid JSON, no markdown, no explanation:
{
  "summary": "2-3 sentence summary of the note",
  "action_items": ["action item 1", "action item 2"],
  "suggested_title": "a concise title"
}

Title: ${title}
Content: ${content}`,
      },
    ],
  });

  const text = (message.content[0] as { text: string }).text;
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}