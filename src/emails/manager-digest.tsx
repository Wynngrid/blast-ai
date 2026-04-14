// Manager digest email template per D-16
// Weekly/monthly summary of AI upskilling progress
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface ManagerDigestEmailProps {
  companyName: string
  period: string
  sessionsCompleted: number
  positiveOutcomeRate: number
  topSkills: string[]
  dashboardUrl: string
  reportUrl: string
}

export function ManagerDigestEmail({
  companyName,
  period,
  sessionsCompleted,
  positiveOutcomeRate,
  topSkills,
  dashboardUrl,
  reportUrl,
}: ManagerDigestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Your ${period} AI Upskilling Summary - ${sessionsCompleted} sessions completed`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>BLAST AI</Text>

          <Heading style={h1}>AI Upskilling Summary</Heading>
          <Text style={heroText}>
            {companyName} | {period}
          </Text>

          <Hr style={hr} />

          <Section>
            <Heading as="h2" style={h2}>Quick Stats</Heading>
            <table style={statsTable}>
              <tbody>
                <tr>
                  <td style={statCell}>
                    <Text style={statValue}>{sessionsCompleted}</Text>
                    <Text style={statLabel}>Sessions</Text>
                  </td>
                  <td style={statCellSpacer} />
                  <td style={statCell}>
                    <Text style={statValue}>{positiveOutcomeRate}%</Text>
                    <Text style={statLabel}>Positive Outcomes</Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {topSkills.length > 0 && (
            <Section>
              <Heading as="h2" style={h2}>Skills Covered</Heading>
              <Text style={text}>
                {topSkills.slice(0, 5).join(' \u2022 ')}
              </Text>
            </Section>
          )}

          <Hr style={hr} />

          <Section style={buttonContainer}>
            <Link href={dashboardUrl} style={button}>
              View Dashboard
            </Link>
            <Text style={buttonSpacer}> </Text>
            <Link href={reportUrl} style={buttonSecondary}>
              Download Full Report
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            This is an automated summary from BLAST AI. You're receiving this because you're an
            admin for {companyName}. To change your notification preferences, visit your dashboard settings.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default ManagerDigestEmail

// Styles - matches existing email patterns
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
}

const logo = {
  fontSize: '20px',
  fontWeight: 'bold' as const,
  color: '#D97757',
  marginBottom: '32px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  margin: '0 0 8px',
}

const heroText = {
  color: '#666',
  fontSize: '14px',
  margin: '0',
}

const h2 = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  margin: '24px 0 12px',
}

const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '24px 0',
}

const statsTable = {
  width: '100%',
}

const statCell = {
  textAlign: 'center' as const,
  padding: '16px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  width: '45%',
}

const statCellSpacer = {
  width: '10%',
}

const statValue = {
  color: '#D97757',
  fontSize: '32px',
  fontWeight: 'bold' as const,
  margin: '0',
}

const statLabel = {
  color: '#666',
  fontSize: '12px',
  margin: '4px 0 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#D97757',
  borderRadius: '6px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  padding: '12px 24px',
  textDecoration: 'none',
}

const buttonSpacer = {
  display: 'inline-block',
  width: '12px',
}

const buttonSecondary = {
  backgroundColor: '#fff',
  border: '1px solid #D97757',
  borderRadius: '6px',
  color: '#D97757',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  padding: '12px 24px',
  textDecoration: 'none',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '20px',
}
