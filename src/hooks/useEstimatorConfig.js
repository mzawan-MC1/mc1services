import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { DEFAULT_ESTIMATOR_CONFIG } from '../config/estimatorConfig';

// Shared by the estimator page, the tools-hub copy of the estimator and
// anywhere else that needs the admin-edited estimator configuration.
// Falls back to the built-in defaults if the settings row is missing.
export function useEstimatorConfig() {
  const { data } = useQuery({
    queryKey: ['estimator-config'],
    queryFn: async () => { try { return await dataLayer.estimator.getConfig(); } catch { return null; } },
    staleTime: 60 * 1000,
  });
  return data || DEFAULT_ESTIMATOR_CONFIG;
}
