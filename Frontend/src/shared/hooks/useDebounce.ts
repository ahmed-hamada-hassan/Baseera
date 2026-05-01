/**
 * @file shared/hooks/useDebounce.ts
 */

import { useState, useEffect } from 'react';

/**
 * يؤخر تحديث القيمة حتى يتوقف المستخدم عن الكتابة
 * مثالي لحقول البحث — يقلل طلبات API بشكل كبير
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
