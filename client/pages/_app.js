import { WagmiConfig } from 'wagmi';
import '../styles/globals.css';
import Layout from '../components/layout.js';
import NextHead from 'next/head';
import { client } from '../wagmi';
import { useState, useEffect } from 'react';
function App({Component, pageProps}){
  const [ mounted, setMounted ] = useState(false);
  useEffect(()=>{
    setMounted(true);
  }, [])
  return (
    <WagmiConfig client={client}>
      <NextHead>
        <title>
          nft-collections
        </title>
      </NextHead>
      <Layout>
        {mounted && <Component {...pageProps}/>}
      </Layout>
    </WagmiConfig>
  )
}

export default App;