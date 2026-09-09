import { useLocation } from 'react-router-dom';
import Header from './Header.js';
import Sidebar from './Sidebar.js';

export default function Layout({ children }) {
  const location = useLocation();
  const isAuthView = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthView) {
    return <div className="min-h-screen bg-app flex items-center justify-center px-4">{children}</div>;
  }

  return (
    <div className="app-shell bg-app">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="app-main flex-1 px-4 md:px-6 py-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
