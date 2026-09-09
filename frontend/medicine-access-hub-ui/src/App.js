import Layout from './components/Layout.js';
import AppRoutes from './routes/AppRoutes.js';
import Toast from './components/Toast.js';
import './App.css';

export default function App() {
  return (
    <Layout>
      <AppRoutes />
      <Toast />
    </Layout>
  );
}
