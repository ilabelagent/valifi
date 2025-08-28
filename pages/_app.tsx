import '../styles.css';
import '../i18n';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AuthProvider } from '../src/auth/hooks/useAuth';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Valifi - Advanced FinTech Platform</title>
        <meta name="description" content="Secure digital banking, investments, and crypto management platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </>
  );
}