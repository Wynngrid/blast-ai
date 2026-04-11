import { getProfile } from '@/actions/profile'
import { redirect } from 'next/navigation'
import { WizardContainer } from '@/components/portal/profile-wizard/wizard-container'

export default async function ProfileEditPage() {
  const result = await getProfile()

  if (!result.success || !result.data) {
    redirect('/portal')
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <WizardContainer initialData={result.data} />
    </div>
  )
}
