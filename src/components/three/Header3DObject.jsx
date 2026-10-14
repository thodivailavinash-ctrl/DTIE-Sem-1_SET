import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Octahedron, Torus } from '@react-three/drei';

function FloatingGem({ reducedMotion }) {
  const gemRef = useRef();
  const ringRef = useRef();

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (gemRef.current) {
      gemRef.current.rotation.y += delta * 0.65;
      gemRef.current.rotation.x += delta * 0.25;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.5;
    }
  });

  return (
    <Float
      speed={reducedMotion ? 0 : 2.2}
      rotationIntensity={reducedMotion ? 0 : 0.3}
      floatIntensity={reducedMotion ? 0 : 0.5}
    >
      <group>
        <Octahedron ref={gemRef} args={[0.85, 0]}>
          <meshPhysicalMaterial
            color="#22D3EE"
            emissive="#22D3EE"
            emissiveIntensity={0.35}
            metalness={0.7}
            roughness={0.15}
            clearcoat={1}
          />
        </Octahedron>
        <Torus ref={ringRef} args={[1.25, 0.04, 16, 48]} rotation={[Math.PI / 2.4, 0.3, 0]}>
          <meshStandardMaterial
            color="#8B5CF6"
            emissive="#8B5CF6"
            emissiveIntensity={1.1}
          />
        </Torus>
      </group>
    </Float>
  );
}

export default function Header3DObject({ reducedMotion = false }) {
  return (
    <div className="w-16 h-16 sm:w-20 sm:h-20 relative shrink-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 3.4], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[2, 2, 2]} intensity={2} color="#22D3EE" />
        <pointLight position={[-2, -1, 2]} intensity={1.8} color="#8B5CF6" />
        <FloatingGem reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
