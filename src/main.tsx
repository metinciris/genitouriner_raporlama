import React from 'react';
import ReactDOM from 'react-dom/client';
// Dinamik olarak tüm TSX bileşenlerinizi yüklemek için Vite glob kullanıyoruz
const modules = import.meta.glob('./components/**/*.tsx', { eager: true });
// import edilmiş modüllerden varsayılan export olan bileşenleri al
const components = Object.values(modules).map((mod: any) => mod.default);

const App: React.FC = () => (
  <>
    {components.map((Component, idx) => (
      <div key={idx} className="mb-8">
        <Component />
      </div>
    ))}
  </>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
