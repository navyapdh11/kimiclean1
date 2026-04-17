import {
  Html,
  Button,
  Container,
  Head,
  Heading,
  Text,
  Preview,
} from '@react-email/components';

interface BookingConfirmationProps {
  bookingId: string;
  date: string;
  service: string;
}

export default function BookingConfirmation({
  bookingId,
  date,
  service,
}: BookingConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your cleaning is confirmed for {date}</Preview>
      <Container style={{ fontFamily: 'system-ui', padding: '20px', maxWidth: '600px' }}>
        <Heading style={{ color: '#2563eb', fontSize: '24px' }}>
          Your Cleaning is Confirmed ✨
        </Heading>
        
        <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
          Booking ID: <strong>{bookingId}</strong>
        </Text>
        
        <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
          Service: <strong>{service}</strong>
        </Text>
        
        <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
          Scheduled: <strong>{date}</strong>
        </Text>

        <Button
          href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?booking=${bookingId}`}
          style={{
            background: '#2563eb',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            display: 'inline-block',
            marginTop: '20px',
          }}
        >
          View in Dashboard
        </Button>

        <Text style={{ color: '#6b7280', fontSize: '12px', marginTop: '30px' }}>
          KimiClean — Enterprise Cleaning with 3D AR Tours
          <br />
          © 2026 KimiClean. All rights reserved.
        </Text>
      </Container>
    </Html>
  );
}
