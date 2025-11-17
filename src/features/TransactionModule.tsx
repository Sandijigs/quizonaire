import React, { useRef } from 'react';
import { Html } from '@react-three/drei';
import { MeshWrapper, NumberVector3 } from '@/shared';
import { Color } from 'three';

interface TransactionModuleProps {
  position: NumberVector3;
  color: string;
  name: string;
}

export const TransactionModule = ({
  position,
  color,
  name,
}: TransactionModuleProps) => {
  const meshRef = useRef<MeshWrapper | null>(null);

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[name === 'Somnia' ? 1 : 0.5, 0]} />
      <meshStandardMaterial color={new Color(color)} />

      <Html position={[0, 1, 0]}>
        <h3 style={{ color: 'lightgreen' }}>{name}</h3>
      </Html>
    </mesh>
  );
};
