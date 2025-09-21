import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>CastRadar - Farcaster Activity Tracker</title>
        <meta name="theme-color" content="#7c3aed" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
