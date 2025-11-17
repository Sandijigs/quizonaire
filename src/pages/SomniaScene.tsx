import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  Suspense,
  useCallback,
} from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls, Html } from '@react-three/drei';
import { useNavigate } from 'react-router';
import * as THREE from 'three';
import { MainSceneModule, modules } from '@/shared/generalModules';
import { lines } from '@/shared/lines';
import { BezierLine } from '@/features/BezierLine';
import { MeshWrapper } from '@/shared';
import { SceneStarrySky } from '@/entities/SceneStarrySky';
import { Model2DTemplate } from '@/features/2DModels';

type RaycastableObject = THREE.Mesh<
  THREE.BufferGeometry<THREE.NormalBufferAttributes>,
  THREE.Material | THREE.Material[],
  THREE.Object3DEventMap
>;

type EmissiveMaterial = THREE.Material & {
  emissive: THREE.Color;
  emissiveIntensity?: number;
};

export const SomniaScene = () => {
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const moduleMeshes = useRef<RaycastableObject[]>([]);
  const [hoveredModule, setHoveredModule] = useState<MainSceneModule | null>(
    null
  );
  const previousHighlighted =
    useRef<THREE.Object3D<THREE.Object3DEventMap> | null>(null);
  const currentlyHighlightedMeshRef = useRef<RaycastableObject | null>(null);
  const aimPointRef = useRef<MeshWrapper | null>(null);
  const { camera, scene } = useThree();
  const navigate = useNavigate();

  useEffect(() => {
    scene.background = new THREE.Color('#000011');
    camera.userData.initialRotation = { x: 0.2, y: 0, z: 0 };
    camera.rotation.set(
      camera.userData.initialRotation.x,
      camera.userData.initialRotation.y,
      camera.userData.initialRotation.z
    );
  }, [scene, camera]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'w':
          setKeys((prev) => ({ ...prev, forward: true }));
          break;
        case 's':
          setKeys((prev) => ({ ...prev, backward: true }));
          break;
        case 'a':
          setKeys((prev) => ({ ...prev, left: true }));
          break;
        case 'd':
          setKeys((prev) => ({ ...prev, right: true }));
          break;
        case 'Enter':
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
          const intersects = raycaster.intersectObjects(
            moduleMeshes.current,
            true
          );
          if (intersects.length > 0) {
            const hit = intersects[0].object;
            const selectedId = hit.userData?.id;
            const module = modules.find((m) => m.id === selectedId);
            if (module) {
              navigate(`/${module.id}`);
            }
          }
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'w':
          setKeys((prev) => ({ ...prev, forward: false }));
          break;
        case 's':
          setKeys((prev) => ({ ...prev, backward: false }));
          break;
        case 'a':
          setKeys((prev) => ({ ...prev, left: false }));
          break;
        case 'd':
          setKeys((prev) => ({ ...prev, right: false }));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [camera, navigate]);

  const resetHighlight = useCallback(() => {
    if (currentlyHighlightedMeshRef.current) {
      const material = currentlyHighlightedMeshRef.current.material;
      if (Array.isArray(material)) {
        material.forEach((mat) => {
          const emissiveMat = mat as EmissiveMaterial;
          if (emissiveMat.emissive) {
            emissiveMat.emissive.set(0x000000);
            if (emissiveMat.emissiveIntensity !== undefined) {
              emissiveMat.emissiveIntensity = 0;
            }
          }
        });
      } else {
        const emissiveMat = material as EmissiveMaterial;
        if (emissiveMat.emissive) {
          emissiveMat.emissive.set(0x000000);
          if (emissiveMat.emissiveIntensity !== undefined) {
            emissiveMat.emissiveIntensity = 0;
          }
        }
      }
      currentlyHighlightedMeshRef.current = null;
    }
  }, []);

  const setHighlight = useCallback((object: RaycastableObject) => {
    resetHighlight();

    const material = object.material;
    const highlightColor = new THREE.Color(0xff0000);
    const highlightIntensity = 1;

    if (Array.isArray(material)) {
      material.forEach((mat) => {
        const emissiveMat = mat as EmissiveMaterial;
        if (emissiveMat.emissive) {
          emissiveMat.emissive.copy(highlightColor);
          if (emissiveMat.emissiveIntensity !== undefined) {
            emissiveMat.emissiveIntensity = highlightIntensity;
          }
        }
      });
    } else {
      const emissiveMat = material as EmissiveMaterial;
      if (emissiveMat.emissive) {
        emissiveMat.emissive.copy(highlightColor);
        if (emissiveMat.emissiveIntensity !== undefined) {
          emissiveMat.emissiveIntensity = highlightIntensity;
        }
      }
    }
    currentlyHighlightedMeshRef.current = object;
  }, []);

  const pulseHighlighted = useCallback((time: number) => {
    if (currentlyHighlightedMeshRef.current) {
      const material = currentlyHighlightedMeshRef.current.material;
      const intensity = 0.5 + 0.5 * Math.sin(time * 5);

      const applyPulse = (mat: THREE.Material) => {
        const emissiveMat = mat as EmissiveMaterial;
        if (emissiveMat.emissiveIntensity !== undefined) {
          emissiveMat.emissiveIntensity = intensity;
        }
      };

      if (Array.isArray(material)) {
        material.forEach(applyPulse);
      } else {
        applyPulse(material);
      }
    }
  }, []);

  const handleRaycastingAndAim = useCallback((state: any) => {
    const time = state.clock.getElapsedTime();
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.normalize();

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(moduleMeshes.current, true);

    if (aimPointRef.current) {
      let hitPoint = camera.position.clone().addScaledVector(direction, 5);
      let pulse = 0.3;

      if (intersects.length > 0) {
        hitPoint = intersects[0].point;
        hitPoint.y += 0.01;
        pulse = 0.3 + 0.1 * Math.sin(time * 5);

        const hit = intersects[0].object;
        const selectedId = hit.userData?.id;
        const module = modules.find((m) => m.id === selectedId);
        setHoveredModule(module || null);
      } else {
        setHoveredModule(null);
      }

      aimPointRef.current.position.copy(hitPoint);
      aimPointRef.current.scale.set(pulse, pulse, pulse);
    }

    if (intersects.length > 0) {
      const newHighlightedObject = intersects[0].object as RaycastableObject;

      if (newHighlightedObject !== currentlyHighlightedMeshRef.current) {
        setHighlight(newHighlightedObject);

        const selectedId = newHighlightedObject.userData?.id;
        const module = modules.find((m) => m.id === selectedId);
        setHoveredModule(module || null);
      }
    } else {
      resetHighlight();
      setHoveredModule(null);
    }
  }, []);

  useFrame((state) => {
    const speed = 0.1;
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.normalize();

    if (keys.forward) {
      camera.position.addScaledVector(direction, speed);
    }
    if (keys.backward) {
      camera.position.addScaledVector(direction, -speed);
    }
    if (keys.left) {
      const left = new THREE.Vector3();
      left.crossVectors(camera.up, direction).normalize();
      camera.position.addScaledVector(left, speed);
    }
    if (keys.right) {
      const right = new THREE.Vector3();
      right.crossVectors(direction, camera.up).normalize();
      camera.position.addScaledVector(right, speed);
    }

    const MIN_X = -8;
    const MAX_X = 8;
    const MIN_Z = -8;
    const MAX_Z = 8;
    camera.position.x = Math.max(MIN_X, Math.min(MAX_X, camera.position.x));
    camera.position.z = Math.max(MIN_Z, Math.min(MAX_Z, camera.position.z));
    camera.position.y = 3;

    handleRaycastingAndAim(state);

    pulseHighlighted(state.clock.getElapsedTime());
  });

  const modulesRender = useMemo(
    () =>
      modules.map((module, index) => (
        <Suspense fallback={null} key={module.id}>
          <mesh
            key={module.id}
            ref={(el) => {
              if (el) {
                moduleMeshes.current[index] = el as RaycastableObject;
              } else {
                delete moduleMeshes.current[index];
              }
            }}
            position={[
              module.position[0],
              module.position[1],
              module.position[2],
            ]}
            userData={{ id: module.id }}
          >
            <Model2DTemplate id={module.id} {...module.model} />
          </mesh>
        </Suspense>
      )),
    []
  );

  const logoLines = useMemo(
    () =>
      lines.map((line, index) => {
        return (
          <BezierLine
            key={index}
            start={line.start}
            end={line.end}
            color={line.color}
            width={line.width}
            curvature={line.curvature}
          />
        );
      }),
    []
  );

  return (
    <>
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} />

      <Suspense fallback={null}>
        <SceneStarrySky />
      </Suspense>

      <mesh ref={aimPointRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="white" />
      </mesh>

      {modulesRender}
      {logoLines}

      {hoveredModule && (
        <Html
          style={{
            padding: '10px',
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderRadius: '8px',
          }}
          position={[
            hoveredModule.position[0],
            hoveredModule.position[1],
            hoveredModule.position[2],
          ]}
        >
          <h3 style={{ color: 'white', margin: 0 }}>
            {hoveredModule.description}
          </h3>
        </Html>
      )}

      <PointerLockControls />
    </>
  );
};
