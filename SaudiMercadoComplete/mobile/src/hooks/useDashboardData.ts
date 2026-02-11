import { useEffect, useState } from 'react';
import { api } from '@api/client';

export const useDashboardData = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const response = await api.get('/analytics/overview');
        if (mounted) setData(response);
      } catch (_error) {
        if (mounted) {
          setData({
            metrics: {
              totalOrders: 0,
              totalRevenue: 0,
              totalProducts: 0,
              totalVendors: 0,
              totalMarkets: 0,
              conversionRate: 0,
              cartAbandonmentRate: 0,
            },
            topProducts: [],
            topVendors: [],
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading };
};
