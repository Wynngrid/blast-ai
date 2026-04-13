import { EarningsDashboard } from '@/components/portal/earnings-dashboard'
import { PayoutRequestForm } from '@/components/portal/payout-request-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function EarningsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Earnings</h2>
        <p className="text-muted-foreground">
          Track your earnings and request payouts
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payout">Request Payout</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <EarningsDashboard />
        </TabsContent>

        <TabsContent value="payout">
          <PayoutRequestForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
