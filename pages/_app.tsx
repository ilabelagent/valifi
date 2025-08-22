import '../styles.css';
import '../i18n';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../src/auth/hooks/useAuth';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}