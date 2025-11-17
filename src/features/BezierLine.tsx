import { NumberVector3 } from '@/shared';
import React, { useMemo } from 'react';
import * as THREE from 'three';

interface BezierLineProps {
  start: NumberVector3;
  end: NumberVector3;
  color: string;
  width: number;
  curvature: number;
  controlPoints?: number[][];
  segments?: number;
}

export const BezierLine = ({
  start,
  end,
  color = '#ffffff',
  width = 0.5,
  curvature = 1,
  controlPoints = [],
  segments = 100,
}: BezierLineProps) => {
  const curve = useMemo(() => {
    const startVec = new THREE.Vector3(start[0], start[1], start[2]);
    const endVec = new THREE.Vector3(end[0], end[1], end[2]);

    let cpVecs = [];
    if (controlPoints.length >= 2) {
      cpVecs = controlPoints
        .slice(0, 2)
        .map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      return new THREE.CubicBezierCurve3(
        startVec,
        cpVecs[0],
        cpVecs[1],
        endVec
      );
    } else if (controlPoints.length === 1) {
      const cp = new THREE.Vector3(
        controlPoints[0][0],
        controlPoints[0][1],
        controlPoints[0][2]
      );
      return new THREE.QuadraticBezierCurve3(startVec, cp, endVec);
    } else {
      const mid = startVec.clone().add(endVec).multiplyScalar(0.5);
      mid.y += curvature;
      return new THREE.QuadraticBezierCurve3(startVec, mid, endVec);
    }
  }, [start, end, curvature, controlPoints]);

  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, segments, width, 8, false),
    [curve, segments, width]
  );

  return (
    <mesh geometry={tubeGeometry} castShadow receiveShadow>
      <meshStandardMaterial color={color} />
    </mesh>
  );
};
