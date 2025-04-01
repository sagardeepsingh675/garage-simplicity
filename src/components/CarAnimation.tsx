
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, PresentationControls, Environment } from '@react-three/drei';
import { Mesh } from 'three';

export default function CarAnimation() {
  const car = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (car.current) {
      car.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.2;
    }
  });

  // Fallback to a simple box model if GLTF fails to load
  const Model = () => {
    try {
      const { scene } = useGLTF('https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/car-muscle/model.gltf');
      return <primitive object={scene} scale={1.5} position={[0, -1, 0]} ref={car} />;
    } catch (error) {
      console.error("Failed to load car model:", error);
      return (
        <mesh ref={car}>
          <boxGeometry args={[3, 1, 6]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.7} roughness={0.2} />
        </mesh>
      );
    }
  };

  return (
    <PresentationControls
      global
      rotation={[0.13, 0, 0]}
      polar={[-0.1, 0.1]}
      azimuth={[-0.5, 0.5]}
      config={{ mass: 2, tension: 400 }}
      snap={{ mass: 4, tension: 300 }}
    >
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Model />
    </PresentationControls>
  );
}
