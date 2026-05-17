const trimTrailingSlash = (value) => String(value || '').replace(/\/$/, '');

const resolveApiBase = () => {
  const configured = trimTrailingSlash(import.meta.env.VITE_API_URL);
  if (configured) return configured;

  return import.meta.env.DEV ? 'http://localhost:5000' : 'https://api.vayl.in';
};

export const API_BASE = resolveApiBase();
