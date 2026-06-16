import React, { useState } from 'react';
import { createEvent } from '../events/eventManager';
import { syncPendingEvents } from '../core/syncWorker';

// مثال لشاشة الكاشير والمبيعات (تسجيل خدمة)
export default function SalesScreen() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // دالة محاكاة ضغطة زر البيع
  const handleAddService = async (serviceName, price) => {
    setLoading(true);
    try {
      // 1. استخراج بيانات الوردية والفرع (في تطبيق حقيقي تأتي من الـ Context أو المتجر)
      const currentBranchId = 'branch-main-01'; 
      const currentShiftId = 'shift-20240616-01';

      // 2. تجهيز الـ Payload (تفاصيل الخدمة المباعة)
      const payload = {
        service_name: serviceName,
        barber_id: 'barber-01',
        price: price,
        discount: 0,
        net_amount: price
      };

      // 3. إنشاء الحدث وحفظه محلياً في Dexie
      // العملية سريعة ولن تتأثر ببطء أو انقطاع الإنترنت
      const newEvent = await createEvent('SERVICE_ADDED', payload, currentBranchId, currentShiftId);

      // 4. تحديث الواجهة فوراً
      setMessage(`✅ تم تسجيل ${serviceName} بنجاح. المبلغ: ${price}`);
      console.log('تم الحفظ محلياً:', newEvent);

      // 5. محاولة تنبيه الـ Sync Worker ليقوم بالمزامنة إن كان هناك إنترنت
      // الـ Worker ذكي ولن يتداخل إذا كان هناك مزامنة أخرى تعمل
      syncPendingEvents();

    } catch (error) {
      console.error('خطأ أثناء الحفظ:', error);
      setMessage('❌ حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
      // إخفاء الرسالة بعد 3 ثواني
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl text-yellow-500 mb-6 font-bold">شاشة المبيعات</h1>
      
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <button 
          onClick={() => handleAddService('حلاقة شعر', 50)}
          disabled={loading}
          className="bg-gray-800 hover:bg-gray-700 border border-yellow-600 p-4 rounded-lg text-xl"
        >
          ✂️ حلاقة شعر (50)
        </button>
        
        <button 
          onClick={() => handleAddService('حلاقة ذقن', 30)}
          disabled={loading}
          className="bg-gray-800 hover:bg-gray-700 border border-yellow-600 p-4 rounded-lg text-xl"
        >
          🧔 حلاقة ذقن (30)
        </button>
      </div>

      {message && (
        <div className="mt-6 p-4 bg-green-900 text-green-100 rounded-lg">
          {message}
        </div>
      )}
    </div>
  );
}
