import React, { useRef, useEffect, useState, CSSProperties } from 'react';
import { ModuleRouteId, modules } from '@/shared/generalModules';
import { useParams } from 'react-router';
import { RealtimeTransactions } from '@/widgets/RealtimeTransactions';
import { MultistreamConsensusScene } from '@/widgets/MultistreamConsensus';
import { OptimisationVisualizer } from '@/widgets/OptimisationVisualizer';
import { SomniaPartners } from '@/widgets/SomniaPartners';
import { IceDB } from '@/widgets/IceDB';
import { Canvas } from '@react-three/fiber';
import { somniaSubGraphApi, somniaSubgraphConfig } from '@/shared/apis';
import * as THREE from 'three';
import axios from 'axios';
import { Quiz } from '@/widgets/Quiz/Quiz';
import { GameWidget } from '@/widgets/QuizGenerator';
import { NFTStaking } from '@/widgets/SpecificTestContract/NFTStaking';

const moduleRouterMap: Record<ModuleRouteId, () => JSX.Element> = {
  multistream: MultistreamConsensusScene,
  icedb: IceDB,
  evm_optimisation: () => (
    <Canvas
      scene={{ background: new THREE.Color('black') }}
      camera={{ position: [0, 10, 10], fov: 60 }}
    >
      <OptimisationVisualizer />
    </Canvas>
  ),
  partners: SomniaPartners,
  transactions: RealtimeTransactions,
  lotr: Quiz,
  infinite_quiz: GameWidget,
  nft_staking: NFTStaking,
};

const generalContainerStyles: CSSProperties = {
  margin: 0,
  padding: 0,
  width: '100%',
  height: '100vh',
  position: 'relative',
};

const commonStyles: CSSProperties = {
  width: '100%',
  height: '50px',
  backgroundColor: 'black',
  padding: '10px',
  color: 'whitesmoke',
  zIndex: 1,
};

const sceneStyles = (): CSSProperties => ({
  position: 'absolute',
  top: '70px',
  width: '100%',
  height: `${window.document.body.clientHeight - 140}px`,
});

const headerStyles: CSSProperties = {
  ...commonStyles,
  borderBottom: '2px solid darkgrey',
  display: 'flex',
  justifyContent: 'space-between',
  position: 'absolute',
  alignItems: 'center',
  top: 0,
};

const footerStyles: CSSProperties = {
  ...commonStyles,
  borderTop: '2px solid darkgrey',
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  bottom: 0,
};

export const ModuleDetails = () => {
  const [totalBlocks, setTotalBlocks] = useState(0);
  const { id } = useParams();
  const module = modules.find((m) => m.id === id);
  const Component = module?.id ? moduleRouterMap[module.id] : () => null;

  const statsRef = useRef({
    totalBlocks: 0,
    totalTransactions: 0,
    todayTransactions: 0,
  });

  useEffect(() => {
    if (id !== 'transactions') return;

    const runQuery = async () => {
      try {
        const stats = await axios.get(
          'https://somnia-poc.w3us.site/api/v2/stats'
        );
        statsRef.current = {
          totalBlocks: 0,
          totalTransactions: Number(stats?.data?.total_transactions ?? 0),
          todayTransactions: Number(stats?.data?.transactions_today ?? 0),
        };
      } catch (error) {
        console.error(error);
      }
    };

    const runPollingQuery = async () => {
      try {
        const url = `${somniaSubGraphApi}/block/latest`;
        const response = await axios.get(url, somniaSubgraphConfig);

        const totalBlocks = response?.data?.number ?? 0;
        const delta =
          totalBlocks - statsRef.current.totalBlocks <= 0 ||
          statsRef.current.totalBlocks === 0
            ? 1
            : totalBlocks - statsRef.current.totalBlocks;
        const transactions_increment =
          (response?.data?.transaction_count ?? 0) * delta;

        statsRef.current.totalBlocks = totalBlocks;
        statsRef.current.totalTransactions += transactions_increment;
        statsRef.current.todayTransactions += transactions_increment;
        setTotalBlocks(totalBlocks);
      } catch (error) {
        console.error(error);
      }
    };

    runQuery();
    const interval = setInterval(runPollingQuery, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [id]);

  return (
    <div style={generalContainerStyles}>
      <div style={headerStyles}>
        <h1>{module?.name}</h1>
        <p style={{ marginRight: '20px' }}>{module?.description}</p>
      </div>
      <div style={sceneStyles()}>
        {id === 'transactions' ? (
          <>
            <div
              style={{
                zIndex: 1,
                position: 'absolute',
                top: '20px',
                left: '20px',
                color: 'green',
              }}
            >
              <h3>Today Blocks: {totalBlocks}</h3>
              <h3>Today Transactions: {statsRef.current.todayTransactions}</h3>
              <h3>Total Transactions: {statsRef.current.totalTransactions}</h3>
            </div>
            <Canvas camera={{ position: [0, 4, 8], fov: 50 }}>
              <Component />
            </Canvas>
          </>
        ) : (
          <Component />
        )}
      </div>
      <div style={footerStyles}>
        <a href="/">Return to scene</a>
      </div>
    </div>
  );
};
