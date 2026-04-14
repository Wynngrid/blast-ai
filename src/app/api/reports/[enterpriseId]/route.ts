// PDF report download API route per D-16
// T-04-17: Verifies auth.uid() owns enterprise before generating report
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateManagerReportBuffer } from '@/actions/reports'
import { format } from 'date-fns'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ enterpriseId: string }> }
) {
  const { enterpriseId } = await params
  const supabase = await createClient()

  // Verify user owns this enterprise (T-04-17 mitigation)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: enterprise } = await supabase
    .from('enterprises')
    .select('id, company_name')
    .eq('id', enterpriseId)
    .eq('user_id', user.id)
    .single()

  if (!enterprise) {
    return NextResponse.json({ error: 'Enterprise not found' }, { status: 404 })
  }

  // Get period from query params
  const url = new URL(request.url)
  const period = (url.searchParams.get('period') as 'week' | 'month' | 'quarter') || 'month'

  const { buffer, error } = await generateManagerReportBuffer(enterpriseId, period)

  if (error || !buffer) {
    return NextResponse.json({ error: error || 'Failed to generate report' }, { status: 500 })
  }

  const filename = `blast-ai-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    },
  })
}
