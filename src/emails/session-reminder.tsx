// 24-hour reminder email per NOTF-03, D-23
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

interface SessionReminderEmailProps {
  recipientType: 'enterprise' | 'practitioner'
  otherPartyName: string // Practitioner name for enterprise, company name for practitioner
  sessionDate: string
  sessionTime: string
  sessionDuration: number
  meetLink: string | null
  briefStuckOn: string
}

export function SessionReminderEmail({
  recipientType,
  otherPartyName,
  sessionDate,
  sessionTime,
  sessionDuration,
  meetLink,
  briefStuckOn,
}: SessionReminderEmailProps) {
  const isEnterprise = recipientType === 'enterprise'

  return (
    <Html>
      <Head />
      <Preview>Reminder: Your session is tomorrow at {sessionTime}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.logo}>BLAST AI</Text>

          <Heading style={styles.heading}>
            Session Tomorrow!
          </Heading>

          <Text style={styles.text}>
            This is a reminder that your {sessionDuration} minute session
            {isEnterprise ? ` with ${otherPartyName}` : ` with a client from ${otherPartyName}`}
            {' '}is scheduled for tomorrow.
          </Text>

          <Section style={styles.card}>
            <Text style={styles.cardLabel}>Date</Text>
            <Text style={styles.cardValue}>{sessionDate}</Text>

            <Text style={styles.cardLabel}>Time</Text>
            <Text style={styles.cardValue}>{sessionTime}</Text>

            <Text style={styles.cardLabel}>Duration</Text>
            <Text style={styles.cardValue}>{sessionDuration} minutes</Text>
          </Section>

          {/* Brief reminder */}
          <Section style={styles.reminderCard}>
            <Text style={styles.reminderTitle}>
              {isEnterprise ? 'Your session focus:' : 'They want help with:'}
            </Text>
            <Text style={styles.reminderText}>{briefStuckOn}</Text>
          </Section>

          {meetLink && (
            <Button href={meetLink} style={styles.button}>
              Join Google Meet
            </Button>
          )}

          <Hr style={styles.hr} />

          <Text style={styles.footer}>
            {isEnterprise
              ? 'Need to reschedule? Contact support at least 24 hours before.'
              : 'Please be ready 5 minutes before the session starts.'
            }
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
  text: {
    fontSize: '14px',
    lineHeight: '24px',
    color: '#4b5563',
    margin: '0 0 16px',
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
  reminderCard: {
    backgroundColor: '#dbeafe', // Light blue
    border: '1px solid #93c5fd',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
  },
  reminderTitle: {
    fontSize: '12px',
    fontWeight: '600' as const,
    color: '#1e40af',
    margin: '0 0 8px',
  },
  reminderText: {
    fontSize: '14px',
    color: '#1e3a8a',
    margin: '0',
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

export default SessionReminderEmail
