import { ModelRotate, NumberVector3 } from '@/shared';
import { useFrame } from '@react-three/fiber'; // Нужен для вращения
import { useLoader, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Model2DTemplateProps {
  id: string;
  imageName: string;
  scale?: number | NumberVector3;
  initialRotation?: NumberVector3;
  rotate?: ModelRotate;
  planeSize?: [number, number];
}

export const Model2DTemplate = ({
  id,
  imageName,
  scale = 1,
  initialRotation = [0, 0, 0],
  rotate,
  planeSize = [1, 1],
}: Model2DTemplateProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { scene: threeScene } = useThree();

  const imageUrl = `${process.env.BASE_URL}models/${imageName}`;

  const texture = useLoader(THREE.TextureLoader, imageUrl);

  const [x, y, z] = Array.isArray(scale) ? scale : [scale, scale, scale];
  const finalScale = new THREE.Vector3(x, y, z);

  const finalInitialRotation = Array.isArray(initialRotation)
    ? initialRotation
    : typeof initialRotation === 'number'
      ? [0, initialRotation, 0]
      : [0, 0, 0];

  useEffect(() => {
    if (meshRef.current) {
      const [rx, ry, rz] = finalInitialRotation;
      meshRef.current.rotation.set(rx, ry, rz);
      meshRef.current.userData.id = id;
    }
  }, [id, finalInitialRotation]);

  useFrame(() => {
    if (rotate && meshRef.current) {
      const [rotateX, rotateY, rotateZ] = rotate.rotateO;
      const [speedX, speedY, speedZ] = rotate.rotateSpeed;

      if (rotateX) {
        meshRef.current.rotation.x += speedX;
      }
      if (rotateY) {
        meshRef.current.rotation.y += speedY;
      }
      if (rotateZ) {
        meshRef.current.rotation.z += speedZ;
      }
    }
  });

  return (
    <mesh ref={meshRef} scale={finalScale as THREE.Vector3}>
      <planeGeometry args={planeSize} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
