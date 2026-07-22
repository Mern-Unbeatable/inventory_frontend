import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/features/store/index.js';
import { AppRouter } from '@/router/router.jsx';
import { ToastProvider } from '@/components/feedback/ToastProvider.jsx';
import { useAuth } from '@/features/auth/authHooks.js';

function AuthBootstrap({ children }) {
  const { bootstrap, isBootstrapped } = useAuth();

  useEffect(() => {
    if (!isBootstrapped) bootstrap();
  }, [bootstrap, isBootstrapped]);

  return children;
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthBootstrap>
          <AppRouter />
          <ToastProvider />
        </AuthBootstrap>
      </BrowserRouter>
    </Provider>
  );
}
