import { BrowserRouter, Routes, Route } from 'react-router';
import { Quiz } from '@/widgets/Quiz/Quiz';
import { GameWidget } from '@/widgets/QuizGenerator';
import { NFTStaking } from '@/widgets/SpecificTestContract/NFTStaking';
import { WagmiProvider, QueryClientProvider, queryClient, config } from '@/config/walletConnect';

const HomePage = () => {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      padding: '20px',
      backgroundColor: '#0a0a0f',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Welcome to Quizonaire</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Blockchain Quiz Game on Celo</p>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/quiz" style={{
          padding: '15px 30px',
          backgroundColor: '#35d07f',
          color: 'black',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}>
          Play Quiz
        </a>
        <a href="/infinite-quiz" style={{
          padding: '15px 30px',
          backgroundColor: '#fbcc5c',
          color: 'black',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}>
          Infinite Quiz
        </a>
        <a href="/nft-staking" style={{
          padding: '15px 30px',
          backgroundColor: '#4678e8',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}>
          NFT Staking
        </a>
      </div>
    </div>
  );
};

export const AppRouter = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/quiz' element={<Quiz />} />
            <Route path='/infinite-quiz' element={<GameWidget />} />
            <Route path='/nft-staking' element={<NFTStaking />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
