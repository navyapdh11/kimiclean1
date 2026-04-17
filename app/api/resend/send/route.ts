import { NextResponse } from 'next/server';
import { sendWithRetry } from '@/lib/resend-client';
import BookingConfirmation from '@/emails/BookingConfirmation';
import { z } from 'zod';

const schema = z.object({
  to: z.string().email(),
  bookingData: z.object({
    bookingId: z.string(),
    date: z.string(),
    service: z.string(),
  }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, bookingData } = schema.parse(body);

    const result = await sendWithRetry(
      to,
      `Booking Confirmed — ${bookingData.service} on ${bookingData.date}`,
      BookingConfirmation(bookingData)
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
