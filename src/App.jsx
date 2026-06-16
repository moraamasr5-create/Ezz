import React, { useEffect } from 'react'
import POSScreen from './screens/POSScreen'
import { initSyncWorker } from './core/syncWorker'
import { seedServices } from './core/db'

function App() {
  useEffect(() => {
    // 1. تشغيل الـ Seed Data لزرع الخدمات محلياً (لن تتكرر إن وجدت)
    seedServices();
    
    // 2. تشغيل عامل المزامنة فور بدء التطبيق
    initSyncWorker();
  }, []);

  return (
    // خلفية الفاخرة المعتمدة #121212 يتم تفعيلها من index.css أيضاً
    <div className="min-h-screen bg-[#121212] text-white font-sans">
      <POSScreen />
    </div>
  )
}

export default App
