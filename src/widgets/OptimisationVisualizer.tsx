import React, { useState, useEffect } from 'react';
import { OrbitControls, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { NumberVector3 } from '@/shared';

type BoxColor = 'red' | 'green' | 'blue';

interface BoxProps {
  position: NumberVector3;
  size: number;
  label: string;
  color: BoxColor;
}

const Box = ({ position, size, label, color }: BoxProps) => {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Html position={[-0.4, size + 0.2, 0]}>
        <p style={{ color: 'white', fontSize: '10px', width: '60px' }}>
          {label}
        </p>
      </Html>
    </group>
  );
};

interface OptimisationBox {
  id: number;
  position: NumberVector3;
  size: number;
  label: string;
  type: 'opt' | 'uno';
  status: 'normal' | 'optimized';
  color: BoxColor;
}

export const OptimisationVisualizer = () => {
  const [boxes, setBoxes] = useState<OptimisationBox[]>([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBoxes((prev) => [
        ...prev,
        {
          id: nextId,
          position: [-10, 0, -1.5],
          size: 1,
          label: 'EVM Code',
          type: 'uno',
          status: 'normal',
          color: 'red',
        },
        {
          id: nextId + 1,
          position: [-10, 0, 1.5],
          size: 1,
          label: 'EVM Code',
          type: 'opt',
          status: 'normal',
          color: 'blue',
        },
      ]);
      setNextId((prev) => prev + 2);
    }, 2000);

    return () => clearInterval(interval);
  }, [nextId]);

  useFrame((_, delta) => {
    setBoxes((prev) =>
      prev
        .map((box) => {
          let newX =
            box.position[0] + (box.status === 'optimized' ? 2 : 1) * delta;
          let newStatus = box.status;
          let newSize = box.size;
          let newColor = box.color;
          let newLabel = box.label;

          if (box.type === 'opt' && box.status === 'normal' && newX >= 0) {
            newStatus = 'optimized';
            newSize = 0.5;
            newColor = 'green';
            newLabel = 'Native Code';
          }

          return {
            ...box,
            position: [newX, box.position[1], box.position[2]] as NumberVector3,
            size: newSize,
            label: newLabel,
            status: newStatus,
            color: newColor,
          };
        })
        .filter((box) => box.position[0] < 10)
    );
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="lightgray" />
      </mesh>
      <mesh position={[0, 0, 1.5]}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color="purple" transparent opacity={0.5} />
      </mesh>
      <Html position={[-11, 0, -1.5]} color="white">
        <h4 style={{ color: 'coral', width: '200px' }}>Not optimized</h4>
      </Html>
      <Html position={[-11, 0, 1.5]}>
        <h4 style={{ color: 'lightblue', width: '200px' }}>Optimized</h4>
      </Html>
      <Html position={[-2.0, 4, 0]}>
        <h3 style={{ color: 'white', width: '300px' }}>
          Optimisator Somnia EVM byte-code
        </h3>
      </Html>
      <Html position={[-1, 1.5, 2]}>
        <h4 style={{ color: 'yellow', width: '200px' }}>Optimisation module</h4>
      </Html>
      {boxes.map((box) => (
        <Box
          key={box.id}
          position={box.position}
          size={box.size}
          label={box.label}
          color={box.color}
        />
      ))}
      <OrbitControls />
    </>
  );
};
