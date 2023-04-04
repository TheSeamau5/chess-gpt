import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { CreateChatCompletionRequest } from 'openai'
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

// Router to request a move
export async function POST(request: Request) {
    // Read the body of the request
    const response = z
        .object({
            moves: z.array(z.string()),
        })
        .parse(await request.json())

    const roles = ['user', 'assistant'] as const
    const messages = response.moves.map((move, index) => ({
        role: index % 2 == 0 ? roles[0] : roles[1],
        content: move,
    }))

    // Ask GPT-4 for the next move
    const completionResponse = await openai.createChatCompletion({
        model: 'gpt-4',
        messages: [
            {
                role: 'system',
                content:
                    'You are a chess engine. User is white and moves first. You are black and move second. Respond only with valid moves.',
            },
            ...messages,
        ],
    })

    const completion = completionResponse.data.choices[0].message?.content!

    return NextResponse.json({
        move: completion,
    })
}
