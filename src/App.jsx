import React, { useEffect, useState } from 'react'
import POSScreen from './screens/POSScreen'
import BarberDashboard from './screens/BarberDashboard'
import LiveQueueDisplay from './screens/LiveQueueDisplay'
import { initSyncWorker } from './core/syncWorker'
import { seedServices } from './core/db'

function App() {
  const [currentScreen, setCurrentScreen] = useState('POS');

  useEffect(() => {
    // 1. تشغيل الـ Seed Data لزرع الخدمات محلياً (لن تتكرر إن وجدت)
    seedServices();
    
    // 2. تشغيل عامل المزامنة فور بدء التطبيق
    initSyncWorker();
  }, []);

  return (
    // خلفية الفاخرة المعتمدة #121212 يتم تفعيلها من index.css أيضاً
    <div className="min-h-screen bg-[#121212] text-white font-sans flex flex-col">
      {/* شريط التنقل العلوي مخفي عند الطباعة أو في شاشة العرض إذا أردنا (نظهره هنا للتبديل السهل) */}
      {currentScreen !== 'QUEUE_DISPLAY' && (
        <nav className="print:hidden bg-[#1a1a1a] border-b border-[#D4AF37]/50 p-4 flex justify-center gap-4 shadow-md">
          <button 
            onClick={() => setCurrentScreen('POS')}
            className={`px-4 py-2 font-bold rounded transition-colors ${currentScreen === 'POS' ? 'bg-[#D4AF37] text-black' : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}
          >
            نقطة البيع (POS)
          </button>
          <button 
            onClick={() => setCurrentScreen('BARBERS')}
            className={`px-4 py-2 font-bold rounded transition-colors ${currentScreen === 'BARBERS' ? 'bg-[#D4AF37] text-black' : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}
          >
            لوحة المصففين
          </button>
          <button 
            onClick={() => setCurrentScreen('QUEUE_DISPLAY')}
            className={`px-4 py-2 font-bold rounded transition-colors ${currentScreen === 'QUEUE_DISPLAY' ? 'bg-[#D4AF37] text-black' : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}
          >
            شاشة الانتظار العامة
          </button>
        </nav>
      )}

      {/* زر عودة مخفي بداخل شاشة العرض فقط حتى يمكن الخروج منها */}
      {currentScreen === 'QUEUE_DISPLAY' && (
        <button 
          onClick={() => setCurrentScreen('POS')}
          className="fixed top-4 left-4 bg-black/50 text-white px-3 py-1 rounded opacity-20 hover:opacity-100 transition-opacity z-50 print:hidden"
        >
          العودة
        </button>
      )}

      <div className="flex-1">
        {currentScreen === 'POS' && <POSScreen />}
        {currentScreen === 'BARBERS' && <BarberDashboard />}
        {currentScreen === 'QUEUE_DISPLAY' && <LiveQueueDisplay />}
      </div>
    </div>
  )
}

export default App

