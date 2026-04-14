// Enterprise booking confirmation email per D-08, D-23
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

interface BookingConfirmationEmailProps {
  practitionerName: string // Revealed on confirmation per D-08
  sessionDate: string // Formatted date
  sessionTime: string // Formatted time with timezone
  sessionDuration: number
  meetLink: string | null
  bookingId: string
}

export function BookingConfirmationEmail({
  practitionerName,
  sessionDate,
  sessionTime,
  sessionDuration,
  meetLink,
  bookingId,
}: BookingConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your session with {practitionerName} is confirmed</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Logo/Brand */}
          <Text style={styles.logo}>BLAST AI</Text>

          <Heading style={styles.heading}>Session Confirmed!</Heading>

          <Text style={styles.text}>
            Your session has been booked successfully. Here are your session details:
          </Text>

          {/* Session details card per D-23 minimal branded */}
          <Section style={styles.card}>
            <Text style={styles.cardLabel}>Practitioner</Text>
            <Text style={styles.cardValue}>{practitionerName}</Text>

            <Text style={styles.cardLabel}>Date</Text>
            <Text style={styles.cardValue}>{sessionDate}</Text>

            <Text style={styles.cardLabel}>Time</Text>
            <Text style={styles.cardValue}>{sessionTime}</Text>

            <Text style={styles.cardLabel}>Duration</Text>
            <Text style={styles.cardValue}>{sessionDuration} minutes</Text>
          </Section>

          {meetLink && (
            <>
              <Text style={styles.text}>
                Click the button below to join your Google Meet session:
              </Text>
              <Button href={meetLink} style={styles.button}>
                Join Google Meet
              </Button>
            </>
          )}

          <Hr style={styles.hr} />

          {/* Prep instructions per D-08 */}
          <Heading as="h2" style={styles.subheading}>
            Preparation Tips
          </Heading>
          <Text style={styles.text}>
            1. Review your session brief and come with specific questions
          </Text>
          <Text style={styles.text}>
            2. Have your work ready to share (code, docs, designs)
          </Text>
          <Text style={styles.text}>
            3. Join 5 minutes early to test audio/video
          </Text>
          <Text style={styles.text}>
            4. Find a quiet space with stable internet
          </Text>

          <Hr style={styles.hr} />

          <Text style={styles.footer}>
            Need to make changes?{' '}
            <a href={`https://blastai.com/booking/${bookingId}`} style={styles.link}>
              View booking details
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Minimal branded styles per D-23
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
    color: '#D97757', // Brand color
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
  button: {
    backgroundColor: '#D97757', // Brand color
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
  link: {
    color: '#D97757',
    textDecoration: 'underline',
  },
}

export default BookingConfirmationEmail
