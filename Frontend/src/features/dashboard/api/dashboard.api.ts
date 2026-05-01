import apiClient from '@/shared/lib/axios';
import { DashboardSchema, type Dashboard } from '@/shared/lib/schemas/openapi.schema';

export const dashboardApi = {
  getDashboardData: async (): Promise<Dashboard> => {
    const { data } = await apiClient.get('/Dashboard');

    // Use safeParse so Zod validation errors don't crash the whole query.
    // If the schema doesn't match exactly we log the issues and still return
    // the raw data cast to Dashboard (fields that exist will still be usable).
    const result = DashboardSchema.safeParse(data);

    if (!result.success) {
      console.warn(
        '[DashboardAPI] Schema mismatch — raw response returned. Issues:',
        result.error.flatten(),
      );
      // Return raw data so the UI can still render whatever the server sends
      return data as Dashboard;
    }

    return result.data;
  },
};
