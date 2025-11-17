import { ModelRotate, NumberVector3 } from '@/shared';
import { useGLTF } from '@react-three/drei';
import { PrimitiveProps, useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface Model3DTemplateProps {
  id: string;
  name: string;
  scale: number;
  initialRotation: NumberVector3;
  rotate: ModelRotate;
}

export const Model3DTemplate = ({
  id,
  name,
  scale = 1,
  initialRotation = [0, 0, 0],
  rotate,
}: Model3DTemplateProps) => {
  const { scene } = useGLTF(`${process.env.BASE_URL}models/${name}`);
  const modelRef = useRef<PrimitiveProps | null>(null);

  const finalScale = Array.isArray(scale) ? scale : [scale, scale, scale];

  const finalRotation = Array.isArray(initialRotation)
    ? initialRotation
    : typeof initialRotation === 'number'
      ? [0, initialRotation, 0]
      : [0, 0, 0];

  useEffect(() => {
    scene.userData.id = id;
  }, [scene, id]);

  useEffect(() => {
    if (modelRef.current) {
      const [rx, ry, rz] = finalRotation;
      modelRef.current.rotation.set(rx, ry, rz);
    }
  }, [finalRotation]);

  useFrame(() => {
    const [rotateX, rotateY, rotateZ] = rotate.rotateO;
    const [sppedX, sppedY, sppedZ] = rotate.rotateSpeed;
    if (rotateX && modelRef.current) {
      modelRef.current.rotation.x += sppedX;
    }
    if (rotateY && modelRef.current) {
      modelRef.current.rotation.y += sppedY;
    }
    if (rotateZ && modelRef.current) {
      modelRef.current.rotation.z += sppedZ;
    }
  });

  return <primitive ref={modelRef} object={scene} scale={finalScale} />;
};
