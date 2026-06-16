// ثوابت أنواع الأحداث الممكنة في النظام
export const EventTypes = {
  // أحداث الوردية (الشيفت)
  SHIFT_OPEN: 'SHIFT_OPEN',
  SHIFT_CLOSING: 'SHIFT_CLOSING', // مرحلة المراجعة وإغلاق الكاشير (يمنع فيها البيع)
  SHIFT_CLOSED: 'SHIFT_CLOSED',   // الإغلاق النهائي وتوليد التقرير
  
  // أحداث المبيعات
  SERVICE_ADDED: 'SERVICE_ADDED',
  PRODUCT_SOLD: 'PRODUCT_SOLD',
  
  // أحداث المصروفات
  EXPENSE_ADDED: 'EXPENSE_ADDED'
};
