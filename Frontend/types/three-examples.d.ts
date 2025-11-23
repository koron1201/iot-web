declare module 'three/examples/jsm/loaders/GLTFLoader' {
  import * as THREE from 'three';

  export class GLTFLoader {
    constructor();
    load(
      url: string,
      onLoad: (gltf: { scene: THREE.Group }) => void,
      onProgress?: (xhr: ProgressEvent<EventTarget>) => void,
      onError?: (error: ErrorEvent) => void
    ): void;
  }

  export type GLTF = {
    scene: THREE.Group;
  };
}
