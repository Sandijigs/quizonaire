import { NumberVector3 } from './types';

export interface TransactionModule {
  id: string;
  name: string;
  position: NumberVector3;
  color: string;
}

export const transactionModules: TransactionModule[] = [
  {
    id: 'dApp_1',
    name: 'dApp_1',
    position: [3, 1, 0],
    color: 'red',
  },
  {
    id: 'dApp_2',
    name: 'dApp_2',
    position: [1.5, 1, 2.598],
    color: 'green',
  },
  {
    id: 'dApp_3',
    name: 'dApp_3',
    position: [-1.5, 1, 2.598],
    color: 'blue',
  },
  {
    id: 'dApp_4',
    name: 'dApp_4',
    position: [-3, 1, 0],
    color: 'orange',
  },
  {
    id: 'dApp_N',
    name: 'dApp_N',
    position: [1.5, 1, -2.598],
    color: 'violet',
  },
  {
    id: 'dApp...',
    name: 'dApp...',
    position: [-1.5, 1, -2.598],
    color: 'aqua',
  },
  {
    id: 'Somnia',
    name: 'Somnia',
    position: [0, 2, 0],
    color: 'silver',
  },
];
