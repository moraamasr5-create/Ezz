import React, { useEffect } from 'react'
import POSScreen from './screens/POSScreen'
import { initSyncWorker } from './core/syncWorker'

function App() {
  useEffect(() => {
    // تشغيل عامل المزامنة فور بدء التطبيق
    initSyncWorker();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <POSScreen />
    </div>
  )
}

export default App
