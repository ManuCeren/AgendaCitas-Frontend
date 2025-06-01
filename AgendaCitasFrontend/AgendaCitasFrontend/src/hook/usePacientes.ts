import { useState, useEffect } from 'react';
import { fetchClient } from '../services/fetchClient';

export function usePacientes() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchClient<any[]>('/api/pacientes/', { method: 'GET' })
      .then(data => setPacientes(data))
      .catch(err => setError(err.message || 'Error al cargar pacientes'))
      .finally(() => setLoading(false));

  }, []);

  return { pacientes, loading, error };
}