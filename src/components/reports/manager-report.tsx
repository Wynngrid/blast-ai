// Manager Report PDF component per D-17
// Executive summary, sessions, skills, outcomes for leadership reporting
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    width: '45%',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D97757',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  outcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  outcomeLabel: {
    fontSize: 11,
  },
  outcomeValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#999',
  },
  skillsList: {
    marginTop: 8,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  skillBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97757',
    marginRight: 8,
  },
  noData: {
    color: '#666',
    fontStyle: 'italic',
  },
})

export interface ManagerReportProps {
  companyName: string
  period: string
  generatedAt: string
  sessionsCompleted: number
  totalHoursUsed: number
  skillsCovered: string[]
  positiveOutcomeRate: number
  outcomeBreakdown: {
    skill_learned: number
    blocker_resolved: number
    need_followup: number
    not_helpful: number
  }
  totalCoinsSpent: number
  topPractitioners: Array<{ name: string; sessions: number }>
}

export function ManagerReport({
  companyName,
  period,
  generatedAt,
  sessionsCompleted,
  totalHoursUsed,
  skillsCovered,
  positiveOutcomeRate,
  outcomeBreakdown,
  totalCoinsSpent,
  topPractitioners,
}: ManagerReportProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AI Upskilling Report</Text>
          <Text style={styles.subtitle}>
            {companyName} | {period}
          </Text>
        </View>

        {/* Executive Summary per D-17 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{sessionsCompleted}</Text>
              <Text style={styles.statLabel}>Sessions Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalHoursUsed}h</Text>
              <Text style={styles.statLabel}>Total Hours</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{positiveOutcomeRate}%</Text>
              <Text style={styles.statLabel}>Positive Outcomes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalCoinsSpent}</Text>
              <Text style={styles.statLabel}>Coins Invested</Text>
            </View>
          </View>
        </View>

        {/* Skills Covered per D-17 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills Covered</Text>
          <View style={styles.skillsList}>
            {skillsCovered.length > 0 ? (
              skillsCovered.slice(0, 10).map((skill, i) => (
                <View key={i} style={styles.skillItem}>
                  <View style={styles.skillBullet} />
                  <Text>{skill}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noData}>No skills tracked yet</Text>
            )}
          </View>
        </View>

        {/* Outcome Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Outcomes</Text>
          <View style={styles.outcomeRow}>
            <Text style={styles.outcomeLabel}>Skills Learned</Text>
            <Text style={styles.outcomeValue}>{outcomeBreakdown.skill_learned}</Text>
          </View>
          <View style={styles.outcomeRow}>
            <Text style={styles.outcomeLabel}>Blockers Resolved</Text>
            <Text style={styles.outcomeValue}>{outcomeBreakdown.blocker_resolved}</Text>
          </View>
          <View style={styles.outcomeRow}>
            <Text style={styles.outcomeLabel}>Need Follow-up</Text>
            <Text style={styles.outcomeValue}>{outcomeBreakdown.need_followup}</Text>
          </View>
          <View style={styles.outcomeRow}>
            <Text style={styles.outcomeLabel}>Not Helpful</Text>
            <Text style={styles.outcomeValue}>{outcomeBreakdown.not_helpful}</Text>
          </View>
        </View>

        {/* Top Practitioners */}
        {topPractitioners.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Most Booked Practitioners</Text>
            {topPractitioners.slice(0, 5).map((p, i) => (
              <View key={i} style={styles.outcomeRow}>
                <Text style={styles.outcomeLabel}>{p.name}</Text>
                <Text style={styles.outcomeValue}>{p.sessions} sessions</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by BLAST AI on {generatedAt} | Confidential
        </Text>
      </Page>
    </Document>
  )
}
