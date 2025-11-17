import React, { useState, useRef, useMemo, CSSProperties } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { DescriptionContainer } from '@/entities/DescriptionContainer';
import * as THREE from 'three';

const btnStyle: CSSProperties = {
  position: 'absolute',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  padding: '5px',
  margin: '5px',
  zIndex: 10,
};

const SceneSetup = () => {
  const { scene } = useThree();
  scene.background = new THREE.Color('#000000'); // Явно задаем черный фон
  return null;
};

interface ParticleStreamProps {
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  material: THREE.Material;
}

const ParticleStream = ({
  startPos,
  endPos,
  material,
}: ParticleStreamProps) => {
  const ref = useRef<THREE.Points | null>(null);
  const count = 20;
  const speed = 0.5;

  useFrame((_, delta) => {
    if (!ref.current) return;
    if (!ref.current.userData.offset) {
      ref.current.userData.offset = 0;
    }
    ref.current.userData.offset += delta * speed;
    if (ref.current.userData.offset > 1) ref.current.userData.offset -= 1;
    const offset = ref.current.userData.offset;

    const positions = ref.current.geometry.attributes.position.array;
    const direction = new THREE.Vector3().subVectors(endPos, startPos);
    const length = direction.length();
    direction.normalize();

    for (let i = 0; i < count; i++) {
      const t = (i / count + offset) % 1;
      const pos = startPos
        .clone()
        .add(direction.clone().multiplyScalar(t * length));
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = startPos.x;
    positions[i * 3 + 1] = startPos.y;
    positions[i * 3 + 2] = startPos.z;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  return <points ref={ref} geometry={geometry} material={material} />;
};

const cubePosition = new THREE.Vector3(0, 0.5, 0);

interface Metrics {
  operation: 'Read' | 'Write' | 'Snapshot';
  ramAccess?: boolean;
  time: number;
}

export const IceDB = () => {
  // Состояние для метрик и визуальных эффектов
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [showIncoming, setShowIncoming] = useState(false);
  const [showOutgoing, setShowOutgoing] = useState(false);
  const [showSnapshot, setShowSnapshot] = useState(false);

  const particleTexture = useMemo(() => {
    const size = 32;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }, []);

  const incomingparticleMaterial = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: particleTexture,
        size: 0.2,
        transparent: true,
        color: 'coral',
      }),
    [particleTexture]
  );

  const outgoingparticleMaterial = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: particleTexture,
        size: 0.2,
        transparent: true,
        color: 'lightblue',
      }),
    [particleTexture]
  );

  const distance = 5;

  const directions = [
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 1, 0),
  ];

  const incomingStreams = useMemo(() => {
    return directions.map((dir, index) => {
      const start = cubePosition
        .clone()
        .add(dir.clone().multiplyScalar(distance));
      const end = cubePosition.clone();
      return {
        start: new THREE.Vector3(
          index % 2 !== 0 ? start.x - 0.1 * index : start.x + 0.1 * index,
          start.y,
          start.z
        ),
        end: new THREE.Vector3(
          index % 2 !== 0 ? end.x - 0.1 * index : end.x + 0.1 * index,
          end.y,
          end.z
        ),
      };
    });
  }, [distance]);

  const outgoingStreams = useMemo(() => {
    return directions.map((dir, index) => {
      const start = cubePosition.clone();
      const end = cubePosition
        .clone()
        .add(dir.clone().multiplyScalar(distance));
      return {
        start: new THREE.Vector3(
          index % 2 !== 0 ? start.x - 0.1 * index : start.x + 0.1 * index,
          start.y,
          start.z
        ),
        end: new THREE.Vector3(
          index % 2 !== 0 ? end.x - 0.1 * index : end.x + 0.1 * index,
          end.y,
          end.z
        ),
      };
    });
  }, [distance]);

  const performRead = () => {
    const ramAccess = Math.random() < 0.8;
    const time = ramAccess ? Math.random() * 35 + 15 : Math.random() * 50 + 50;
    setMetrics({ operation: 'Read', ramAccess, time });
    setShowOutgoing(true);
    setTimeout(() => setShowOutgoing(false), 1000);
  };

  const performWrite = () => {
    const ramAccess = Math.random() < 0.7;
    const time = ramAccess ? Math.random() * 40 + 10 : Math.random() * 60 + 40;
    setMetrics({ operation: 'Write', ramAccess, time });
    setShowIncoming(true);
    setTimeout(() => setShowIncoming(false), 1000);
  };

  const takeSnapshot = () => {
    setMetrics({ operation: 'Snapshot', time: 100 });
    setShowSnapshot(true);
    setTimeout(() => setShowSnapshot(false), 1000);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <DescriptionContainer>
        <>
          <h2>Metrics</h2>
          <p>Operation: {metrics?.operation || 'No'}</p>
          <p>Access to RAM: {metrics?.ramAccess ? 'Yes' : 'No'}</p>
          <p>
            Time:{' '}
            {metrics?.time
              ? `${metrics?.time?.toFixed(4)} nano sec`
              : 'Unknown'}
          </p>
        </>
      </DescriptionContainer>
      <button
        style={{ ...btnStyle, left: '15px', top: '180px' }}
        onClick={performRead}
      >
        Execute read
      </button>
      <button
        style={{ ...btnStyle, left: '15px', top: '210px' }}
        onClick={performWrite}
      >
        Execute write
      </button>
      <button
        style={{ ...btnStyle, left: '15px', top: '240px' }}
        onClick={takeSnapshot}
      >
        Create snapshot
      </button>
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
        <SceneSetup />
        <ambientLight intensity={0.5} />
        <directionalLight castShadow position={[5, 10, 5]} intensity={1} />

        <mesh castShadow receiveShadow position={cubePosition}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="green" />
        </mesh>

        {showIncoming &&
          incomingStreams.map((stream, i) => (
            <ParticleStream
              key={`incoming-${i}`}
              startPos={stream.start}
              endPos={stream.end}
              material={incomingparticleMaterial}
            />
          ))}

        {showOutgoing &&
          outgoingStreams.map((stream, i) => (
            <ParticleStream
              key={`outgoing-${i}`}
              startPos={stream.start}
              endPos={stream.end}
              material={outgoingparticleMaterial}
            />
          ))}

        {showSnapshot && (
          <mesh position={cubePosition}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="yellow" transparent opacity={0.5} />
          </mesh>
        )}

        <OrbitControls />
      </Canvas>
    </div>
  );
};
