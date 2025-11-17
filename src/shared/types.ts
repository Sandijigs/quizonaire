import {
  BufferGeometry,
  Material,
  Mesh,
  NormalBufferAttributes,
  Object3DEventMap,
} from 'three';

export type NumberVector3 = [number, number, number];
export type BooleanVector3 = [boolean, boolean, boolean];

export type MeshWrapper = Mesh<
  BufferGeometry<NormalBufferAttributes>,
  Material | Material[],
  Object3DEventMap
>;

export type Coords = { x: number; y: number; z: number };

interface Contract {
  hash: string;
  implementation_name: string;
  name: string;
  ens_domain_name: string;
  metadata: {
    slug: string;
    name: string;
    tagType: string;
    ordinal: number;
    meta: object;
  };
}

export interface MinimalTransactionDto {
  method: string;
  raw_input: string;
  transaction_types: string[];
  created_contract: Contract;
}
