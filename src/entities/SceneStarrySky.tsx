import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

export const SceneStarrySky = () => {
  const starsRef = useRef<THREE.Points | null>(null);

  useFrame((state) => {
    if (starsRef.current) {
      const lightness = 0.5 + 0.5 * Math.sin(state.clock.getElapsedTime());

      const material = starsRef.current.material as THREE.PointsMaterial;
      material?.color?.setHSL(0.6, 0.8, lightness);
    }
  });
  return (
    <>
      <Stars
        ref={starsRef}
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
    </>
  );
};
