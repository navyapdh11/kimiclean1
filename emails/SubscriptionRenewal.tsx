import {
  Html,
  Container,
  Head,
  Heading,
  Text,
  Preview,
} from '@react-email/components';

interface SubscriptionRenewalProps {
  periodEnd: Date;
}

export default function SubscriptionRenewal({
  periodEnd,
}: SubscriptionRenewalProps) {
  const formattedDate = new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'long',
  }).format(periodEnd);

  return (
    <Html>
      <Head />
      <Preview>Your subscription has been renewed</Preview>
      <Container style={{ fontFamily: 'system-ui', padding: '20px', maxWidth: '600px' }}>
        <Heading style={{ color: '#2563eb', fontSize: '24px' }}>
          Subscription Renewed 🎉
        </Heading>
        
        <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
          Thank you for being a valued KimiClean customer. Your subscription
          has been successfully renewed.
        </Text>
        
        <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
          Next billing date: <strong>{formattedDate}</strong>
        </Text>

        <Text style={{ color: '#6b7280', fontSize: '12px', marginTop: '30px' }}>
          KimiClean — Enterprise Cleaning with 3D AR Tours
          <br />
          © 2026 KimiClean. All rights reserved.
        </Text>
      </Container>
    </Html>
  );
}
