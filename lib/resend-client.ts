import { Resend } from 'resend';
import { createClient } from './supabase';

const resend = new Resend(process.env.RESEND_API_KEY);
const MAX_RETRIES = 3;

export async function sendWithRetry(
  to: string,
  subject: string,
  reactComponent: React.ReactElement,
  attempt = 1
): Promise<{ id: string } | null> {
  const supabase = createClient();
  
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
      to,
      subject,
      react: reactComponent,
      tags: [{ name: 'source', value: 'kimiclean-platform' }],
    });

    if (error) throw error;

    await supabase.from('email_logs').insert({
      recipient: to,
      subject,
      resend_id: data?.id,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    return data;
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
      return sendWithRetry(to, subject, reactComponent, attempt + 1);
    }

    await supabase.from('failed_emails').insert({
      recipient: to,
      subject,
      error: (err as Error).message,
      retry_count: attempt,
    });

    return null;
  }
}
