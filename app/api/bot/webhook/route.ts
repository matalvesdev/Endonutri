import { NextRequest, NextResponse } from 'next/server';
import { bot } from '@/lib/bot';

// Ensure the bot handles the incoming webhook payload
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to process update' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Webhook is active. Send POST requests.' });
}
