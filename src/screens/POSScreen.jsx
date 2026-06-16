import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../core/db';
import { createEvent } from '../events/eventManager';
import { syncPendingEvents } from '../core/syncWorker';
import { EventTypes } from '../events/eventTypes';
import SyncIndicator from '../components/SyncIndicator';

export default function POSScreen() {
  const currentBranchId = 'branch-main-01'; 
  const currentShiftId = 'shift-20240616-01'; // في التطبيق الحقيقي سيتم توليده يومياً

  // تحديد حالة الوردية محلياً (يمكن قراءتها من آخر حدث في Dexie)
  const [shiftState, setShiftState] = useState('CLOSED'); // OPEN | CLOSING | CLOSED
  const [message, setMessage] = useState('');

  // جلب إجمالي المبيعات محلياً من Dexie بناءً على أحداث الخدمة للوردية الحالية
  const salesEvents = useLiveQuery(
    () => db.events
      .where('shift_id').equals(currentShiftId)
      .filter(e => e.event_type === EventTypes.SERVICE_ADDED)
      .toArray(),
    [currentShiftId]
  ) || [];

  const totalSales = salesEvents.reduce((total, event) => total + (event.payload?.price || 0), 0);

  // دوال التعامل مع الأحداث (كل زر يكتب حدث فقط)
  
  const handleOpenShift = async () => {
    await createEvent(EventTypes.SHIFT_OPEN, { opened_by: 'Ahmed' }, currentBranchId, currentShiftId);
    setShiftState('OPEN');
    setMessage('✅ تم فتح الوردية بنجاح');
    syncPendingEvents();
  };

  const handleAddService = async (serviceName, price) => {
    if (shiftState !== 'OPEN') return;
    
    await createEvent(EventTypes.SERVICE_ADDED, { 
      service_name: serviceName, 
      price: price,
      barber_id: 'barber-01'
    }, currentBranchId, currentShiftId);
    
    setMessage(`🛒 تمت إضافة ${serviceName}`);
    syncPendingEvents();
  };

  const handleStartClosing = async () => {
    // الانتقال لمرحلة المراجعة (CLOSING) يمنع إضافة مبيعات جديدة
    await createEvent(EventTypes.SHIFT_CLOSING, { 
      expected_cash: totalSales 
    }, currentBranchId, currentShiftId);
    
    setShiftState('CLOSING');
    setMessage('🔒 الوردية في وضع الإغلاق للمراجعة...');
    syncPendingEvents();
  };

  const handleConfirmClose = async () => {
    // تأكيد الإغلاق النهائي (CLOSED)
    // لاحظ: n8n هو من سيحسب التقرير النهائي من السحابة، لكننا نرسل ملخصاً صغيراً 
    // كـ payload للحدث (للعرض المحلي لو أردنا، رغم أن n8n لا يعتمد عليه).
    await createEvent(EventTypes.SHIFT_CLOSED, { 
      closed_by: 'Ahmed',
      local_computed_total: totalSales
    }, currentBranchId, currentShiftId);
    
    setShiftState('CLOSED');
    setMessage('🛑 تم إنهاء الوردية بنجاح');
    syncPendingEvents();
  };

  // إخفاء الرسائل بعد 3 ثواني
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen" dir="rtl">
      {/* الهيدر مع مؤشر المزامنة */}
      <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
        <div>
          <h1 className="text-3xl text-yellow-500 font-bold">شاشة الكاشير</h1>
          <p className="text-gray-400 mt-1">وردية: {currentShiftId}</p>
        </div>
        <SyncIndicator />
      </div>

      {/* منطقة الرسائل */}
      {message && (
        <div className="mb-6 p-4 bg-gray-800 border border-yellow-600 text-yellow-500 rounded-lg">
          {message}
        </div>
      )}

      {/* حالة الوردية مغلقة */}
      {shiftState === 'CLOSED' && (
        <div className="text-center py-20">
          <h2 className="text-2xl mb-4 text-gray-400">الوردية مغلقة حالياً</h2>
          <button 
            onClick={handleOpenShift}
            className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg text-xl font-bold"
          >
            فتح وردية جديدة 🔓
          </button>
        </div>
      )}

      {/* حالة الوردية مفتوحة (البيع متاح) */}
      {shiftState === 'OPEN' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* قسم المبيعات */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <button onClick={() => handleAddService('حلاقة شعر', 50)} className="bg-gray-800 border border-gray-600 hover:border-yellow-500 p-6 rounded-lg text-xl">
              ✂️ حلاقة شعر (50)
            </button>
            <button onClick={() => handleAddService('حلاقة ذقن', 30)} className="bg-gray-800 border border-gray-600 hover:border-yellow-500 p-6 rounded-lg text-xl">
              🧔 حلاقة ذقن (30)
            </button>
            <button onClick={() => handleAddService('تنظيف بشرة', 100)} className="bg-gray-800 border border-gray-600 hover:border-yellow-500 p-6 rounded-lg text-xl">
              💆‍♂️ تنظيف بشرة (100)
            </button>
            <button onClick={() => handleAddService('صبغة', 80)} className="bg-gray-800 border border-gray-600 hover:border-yellow-500 p-6 rounded-lg text-xl">
              🎨 صبغة (80)
            </button>
          </div>

          {/* لوحة التحكم الجانبية */}
          <div className="bg-gray-800 p-6 rounded-lg flex flex-col justify-between border border-gray-700">
            <div>
              <h3 className="text-xl text-gray-300 mb-4">ملخص الوردية الحالي</h3>
              <div className="flex justify-between items-center text-2xl font-bold text-yellow-500">
                <span>الإجمالي:</span>
                <span>{totalSales} ريال</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">عدد العمليات: {salesEvents.length}</p>
            </div>
            
            <button 
              onClick={handleStartClosing}
              className="w-full bg-red-900 hover:bg-red-800 text-red-100 border border-red-700 px-4 py-3 rounded-lg font-bold mt-8"
            >
              قفل الوردية 🔒
            </button>
          </div>
        </div>
      )}

      {/* حالة الوردية قيد الإغلاق (مراجعة) */}
      {shiftState === 'CLOSING' && (
        <div className="bg-gray-800 p-8 rounded-lg border border-yellow-600 max-w-xl mx-auto text-center mt-10">
          <h2 className="text-2xl text-yellow-500 font-bold mb-6">مراجعة إغلاق الوردية</h2>
          <p className="text-gray-300 text-lg mb-8">
            الكاشير المتوقع في الصندوق: <span className="font-bold text-2xl text-white mx-2">{totalSales}</span> ريال
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => setShiftState('OPEN')} // عودة للفتح في حال وجود خطأ
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
            >
              تراجع ↩️
            </button>
            <button 
              onClick={handleConfirmClose}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold"
            >
              تأكيد الإغلاق النهائي 🛑
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
