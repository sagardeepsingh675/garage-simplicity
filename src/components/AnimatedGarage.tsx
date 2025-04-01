
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import CarAnimation from './CarAnimation';

export default function AnimatedGarage() {
  return (
    <div className="w-full h-[400px] md:h-[500px]">
      <Suspense fallback={
        <div className="flex items-center justify-center w-full h-full bg-muted rounded-lg">
          <div className="animate-pulse flex space-x-2">
            <div className="h-3 w-3 bg-primary rounded-full"></div>
            <div className="h-3 w-3 bg-primary rounded-full"></div>
            <div className="h-3 w-3 bg-primary rounded-full"></div>
          </div>
        </div>
      }>
        <Canvas
          camera={{ position: [0, 0, 10], fov: 35 }}
          className="w-full h-full rounded-lg shadow-xl"
          onError={(e) => console.error("Canvas error:", e)}
        >
          <OrbitControls enableZoom={false} />
          <CarAnimation />
        </Canvas>
      </Suspense>
    </div>
  );
}
