import { BooleanVector3, NumberVector3 } from './types';

export type ModuleRouteId =
  | 'multistream'
  | 'icedb'
  | 'evm_optimisation'
  | 'partners'
  | 'transactions'
  | 'lotr'
  | 'infinite_quiz'
  | 'nft_staking';

export interface ModelRotate {
  rotateSpeed: NumberVector3;
  rotateO: BooleanVector3;
}

export interface Model3D {
  name: string;
  rotate: ModelRotate;
  scale: number;
  initialRotation: NumberVector3;
  imageName: string;
}

export interface MainSceneModule {
  id: ModuleRouteId;
  name: string;

  position: NumberVector3;
  color: string;
  description: string;
  model: Model3D;
}

export const modules: MainSceneModule[] = [
  {
    id: 'multistream',
    name: 'Consensus Mechanism',
    position: [-3.3, 3.8, 0],
    color: 'blue',
    description: 'Demonstaration of Multistream consensus',
    model: {
      name: 'multistream_pipe.glb',
      rotate: {
        rotateSpeed: [0, 0, 0.01],
        rotateO: [false, false, true],
      },
      scale: 1.25,
      initialRotation: [0, 0, 0],
      imageName: 'multistream_pipe.png',
    },
  },
  {
    id: 'icedb',
    name: 'Database (IceDB)',
    position: [1, 6.5, 0],
    color: 'red',
    description: 'Visualisation of IceDB speed',
    model: {
      name: 'ice_db.glb',
      rotate: {
        rotateSpeed: [0, 0.01, 0],
        rotateO: [false, true, false],
      },
      scale: 1.25,
      initialRotation: [0, 0, 0],
      imageName: 'ice_db.png',
    },
  },
  {
    id: 'evm_optimisation',
    name: 'EVM Optimization',
    position: [-1, 1, 0],
    color: 'yellow',
    description: 'Optimization EVM-bitecode',
    model: {
      name: 'evm_optimisation.glb',
      rotate: {
        rotateSpeed: [0, 0.01, 0],
        rotateO: [false, true, false],
      },
      scale: 0.85,
      initialRotation: [0, 0, 0],
      imageName: 'evm_optimisation.png',
    },
  },
  {
    id: 'partners',
    name: 'Ecosystem Partners',
    position: [3.2, 3.7, 0],
    color: 'green',
    description: 'Somnia ecosystem partners',
    model: {
      name: 'partnerships_bros.glb',
      rotate: {
        rotateSpeed: [0, 0, 0.01],
        rotateO: [false, false, true],
      },
      scale: 1.25,
      initialRotation: [0, 0, 0],
      imageName: 'partnerships_bros.png',
    },
  },
  {
    id: 'transactions',
    name: 'Transaction Visualization',
    position: [0, 3.4, 0],
    color: 'purple',
    description: 'Transactions in real time',
    model: {
      name: 'somnia_logo.glb',
      rotate: {
        rotateSpeed: [0, -0.005, 0],
        rotateO: [false, true, false],
      },
      scale: 1.25,
      initialRotation: [0, 0, 0],
      imageName: 'somnia_logo.png',
    },
  },
  {
    id: 'infinite_quiz',
    name: 'Infinite Quiz',
    position: [-3, 3, -4],
    color: 'violet',
    description: 'Infinite Quiz',
    model: {
      name: 'quiz.glb',
      rotate: {
        rotateSpeed: [0, 0, 0],
        rotateO: [false, true, false],
      },
      scale: 1.25,
      initialRotation: [0, 0, 0],
      imageName: 'quiz.png',
    },
  },
  {
    id: 'lotr',
    name: 'LOTR',
    position: [3, 3, -4],
    color: 'orange',
    description: 'Lord of the Ring Quiz',
    model: {
      name: 'lotr.glb',
      rotate: {
        rotateSpeed: [0, 0, 0],
        rotateO: [false, true, false],
      },
      scale: 1.25,
      initialRotation: [0, 0, 0],
      imageName: 'lotr.png',
    },
  },
  {
    id: 'nft_staking',
    name: 'NFT_Staking',
    position: [0, 3, -4],
    color: 'red',
    description: 'NFT_Staking',
    model: {
      name: 'nft_staking.glb',
      rotate: {
        rotateSpeed: [0, 0, 0],
        rotateO: [false, true, false],
      },
      scale: 1.25,
      initialRotation: [0, 0, 0],
      imageName: 'nft_staking.png',
    },
  },
];
