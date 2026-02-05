import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { SYSTEM_PROMPT } from '@/lib/chat/prompts'
import type { ChatMessage } from '@/lib/chat/types'

const MAX_TURNS = 5

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] }

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Messages required' }, { status: 400 })
    }

    // Count user messages to enforce turn limit
    const userMessages = messages.filter((m) => m.role === 'user')
    if (userMessages.length > MAX_TURNS) {
      return Response.json(
        {
          error: 'limit',
          message:
            'You\'ve reached the conversation limit. For more help, email support@scratchanddentfinder.com.',
        },
        { status: 200 }
      )
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
      stream: true,
      max_tokens: 300,
      temperature: 0.3,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content
          if (content) {
            controller.enqueue(encoder.encode(content))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
