import { CoinBalance } from '@/components/coins/coin-balance'
import { PurchasePackages } from '@/components/coins/purchase-packages'
import Script from 'next/script'

export default function CoinsPage() {
  return (
    <>
      {/* Razorpay checkout script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <span className="font-bold text-lg">BLAST AI</span>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-8">BLAST Coins</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <CoinBalance />
            </div>
            <div className="lg:col-span-2">
              <PurchasePackages />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
