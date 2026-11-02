import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/fraunces/full-italic.css';
import '@fontsource-variable/manrope';
import './styles/site.css';
import { SiteDataProvider, useSiteData } from './site/SiteData.jsx';
import Home from './site/Home.jsx';
import InsightDetail from './site/InsightDetail.jsx';
import { NotFoundBlock, SiteShell } from './site/Layout.jsx';
import { LoadingState } from './site/States.jsx';

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

function NotFoundPage() {
  const { data } = useSiteData();
  return data ? <SiteShell data={data}><NotFoundBlock /></SiteShell> : <NotFoundBlock />;
}

function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<Suspense fallback={<LoadingState />}><AdminApp /></Suspense>} />
      <Route
        path="*"
        element={(
          <SiteDataProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/insights/:slug" element={<InsightDetail />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </SiteDataProvider>
        )}
      />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
