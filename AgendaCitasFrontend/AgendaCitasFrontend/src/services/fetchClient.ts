// src/services/fetchClient.ts
const BASE_URL = import.meta.env.VITE_API_URL;
console.log('BASE_URL', BASE_URL); 

export async function fetchClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      // -------- OPCIONES POR DEFECTO ----------
      method: 'GET',
      credentials: 'include',              
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // ---------- MANEJO DE ERRORES ------------
    if (!response.ok) {
      const text = await response.text();          
      throw new Error(
        `Error ${response.status}: ${response.statusText}\n${text}`
      );
    }

    // ---------- PARSE JSON -------------------
    return (await response.json()) as T;
  } catch (err) {
    // Puedes loguear o reenviar a un servicio de errores aquí
    throw err;
  }
}
