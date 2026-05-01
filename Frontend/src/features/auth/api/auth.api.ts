/**
 * @file features/auth/api/auth.api.ts
 */

import apiClient from '@/shared/lib/axios';
import { 
  AuthResponseSchema,
  type AuthResponse,
  type LoginRequest,
  type RegisterRequest
} from '@/shared/lib/schemas/openapi.schema';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/Auth/login', credentials);
    return AuthResponseSchema.parse(data);
  },

  register: async (details: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/Auth/register', details);
    return AuthResponseSchema.parse(data);
  },
};
