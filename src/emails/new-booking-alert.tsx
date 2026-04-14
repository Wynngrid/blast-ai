// Practitioner new booking alert email per NOTF-02, D-23
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Preview,
  Heading,
} from '@react-email/components'

interface NewBookingAlertEmailProps {
  sessionDate: string
  sessionTime: string
  sessionDuration: number
  briefStuckOn: string
  briefDesiredOutcome: string
  briefContext: string | null
  bookingId: string
}

export function NewBookingAlertEmail({
  sessionDate,
  sessionTime,
  sessionDuration,
  briefStuckOn,
  briefDesiredOutcome,
  briefContext,
  bookingId,
}: NewBookingAlertEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New {sessionDuration} minute session booked for {sessionDate}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.logo}>BLAST AI</Text>

          <Heading style={styles.heading}>New Session Booked!</Heading>

          <Text style={styles.text}>
            You have a new session scheduled. Here are the details:
          </Text>

          {/* Session details */}
          <Section style={styles.card}>
            <Text style={styles.cardLabel}>Date</Text>
            <Text style={styles.cardValue}>{sessionDate}</Text>

            <Text style={styles.cardLabel}>Time</Text>
            <Text style={styles.cardValue}>{sessionTime}</Text>

            <Text style={styles.cardLabel}>Duration</Text>
            <Text style={styles.cardValue}>{sessionDuration} minutes</Text>
          </Section>

          {/* Session brief preview */}
          <Heading as="h2" style={styles.subheading}>Session Brief</Heading>

          <Section style={styles.briefCard}>
            <Text style={styles.briefLabel}>What they're stuck on:</Text>
            <Text style={styles.briefText}>{briefStuckOn}</Text>

            <Text style={styles.briefLabel}>Desired outcome:</Text>
            <Text style={styles.briefText}>{briefDesiredOutcome}</Text>

            {briefContext && (
              <>
                <Text style={styles.briefLabel}>Context:</Text>
                <Text style={styles.briefText}>{briefContext}</Text>
              </>
            )}
          </Section>

          <Button href={`https://blastai.com/portal/sessions`} style={styles.button}>
            View Full Brief
          </Button>

          <Hr style={styles.hr} />

          <Text style={styles.footer}>
            This session has been added to your calendar.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#f9fafb',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold' as const,
    color: '#D97757',
    marginBottom: '32px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#111827',
    marginBottom: '16px',
  },
  subheading: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: '12px',
  },
  text: {
    fontSize: '14px',
    lineHeight: '24px',
    color: '#4b5563',
    margin: '0 0 12px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
  },
  cardLabel: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '0 0 4px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  cardValue: {
    fontSize: '16px',
    fontWeight: '500' as const,
    color: '#111827',
    margin: '0 0 16px',
  },
  briefCard: {
    backgroundColor: '#fef3c7', // Warm yellow background
    border: '1px solid #fcd34d',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '24px',
  },
  briefLabel: {
    fontSize: '12px',
    fontWeight: '600' as const,
    color: '#92400e',
    margin: '0 0 4px',
  },
  briefText: {
    fontSize: '14px',
    color: '#78350f',
    margin: '0 0 16px',
    lineHeight: '22px',
  },
  button: {
    backgroundColor: '#D97757',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500' as const,
    textDecoration: 'none',
    display: 'inline-block',
  },
  hr: {
    borderColor: '#e5e7eb',
    margin: '32px 0',
  },
  footer: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center' as const,
  },
}

export default NewBookingAlertEmail
