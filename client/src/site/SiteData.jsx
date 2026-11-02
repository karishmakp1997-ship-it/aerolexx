import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const SiteDataContext = createContext(null);

export function SiteDataProvider({ children }) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await api('/api/public/home');
      setState({ data, loading: false, error: null });
    } catch (e) {
      setState({ data: null, loading: false, error: e.message });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return <SiteDataContext.Provider value={{ ...state, reload: load }}>{children}</SiteDataContext.Provider>;
}

export const useSiteData = () => useContext(SiteDataContext);
