'use client';

import DeliveryAreaSearch from '@/components/DeliveryAreaSearch';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-8 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-red-700">اطلب أونلاين</p>
          <h1 className="mt-2 text-5xl font-bold text-gray-900">ماكسز</h1>
          <p className="mt-3 text-lg text-gray-600">فرايد تشيكن وسندوتشات لذيذة</p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">اختر منطقة التوصيل</h2>
          <DeliveryAreaSearch />
        </div>
      </main>
    </div>
  );
}
