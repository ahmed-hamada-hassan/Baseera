/**
 * @file shared/lib/schemas/auth.schema.ts
 * @description User schema for Zustand auth store
 */

export interface User {
  id:       string;
  email:    string;
  fullName: string;
}
