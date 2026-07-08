import { NextResponse } from 'next/server';
import { routeAgent } from '@/ai/router/router';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Pass the message to the AI Router which manages agents
    const reply = await routeAgent(message);

    return NextResponse.json({ reply });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error generating chat response:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while communicating with the AI Agent.' },
      { status: 500 }
    );
  }
}

