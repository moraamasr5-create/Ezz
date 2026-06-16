import Dexie from 'dexie';

// إنشاء قاعدة البيانات المحلية باسم الصالون
export const db = new Dexie('SalonDatabase');

// تعريف جداول قاعدة البيانات
db.version(1).stores({
  // جدول الأحداث (الأساس في Event Sourcing)
  // العمود الأول (id) هو المفتاح الرئيسي (Primary Key)
  // الأعمدة الأخرى المذكورة (sync_status, created_at) تم إضافتها لعمل فهرسة (Index) 
  // لتسريع عمليات البحث (مثلاً: البحث عن الأحداث المعلقة بسرعة)
  events: 'id, sync_status, created_at, branch_id, shift_id'
});

// ملاحظة: الحقول الأخرى مثل event_type و payload سيتم حفظها بشكل طبيعي داخل الكائن،
// لا حاجة لذكرها هنا إلا إذا كنا سنبحث بداخلها.
