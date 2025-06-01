import { useState, useEffect } from 'react';
import { fetchClient } from '../services/fetchClient';

export function useCitas() {
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchClient<any[]>('/api/citas/', { method: 'GET' })
      .then(data => setCitas(data))
      .catch(err => setError(err.message || 'Error al cargar citas'))
      .finally(() => setLoading(false));
  }, []);

  return { citas, loading, error };
}
