import React from 'react';
import { MeshReflectorMaterial, Plane } from '@react-three/drei';

export const SceneConstellation = () => {
  return (
    <Plane name="floor" rotation={[-Math.PI / 2, 0, 0]} args={[100, 100]}>
      <MeshReflectorMaterial
        blur={[400, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={0.8}
        roughness={0.1}
        metalness={0.9}
        mirror={0.5}
        side={2}
      />
    </Plane>
  );
};
