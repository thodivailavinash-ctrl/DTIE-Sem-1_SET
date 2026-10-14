import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Torus, Cylinder, Sparkles, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function WalletObject({ isSignup = false, isSuccess = false, reducedMotion = false }) {
  const rootGroupRef = useRef();
  const walletGroupRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const coinsGroupRef = useRef();
  const holoGroupRef = useRef();

  // Coin positions orbiting the wallet
  const coinConfigs = useMemo(
    () => [
      { pos: [-1.85, 0.85, 0.7], rot: [0.4, 0.5, 0.2], speed: 1.3 },
      { pos: [1.95, 0.65, 0.55], rot: [-0.3, 0.8, -0.2], speed: 1.1 },
      { pos: [-1.55, -0.95, 0.85], rot: [0.6, -0.4, 0.5], speed: 1.5 },
      { pos: [1.65, -0.75, 0.9], rot: [-0.5, -0.6, 0.3], speed: 1.2 },
      { pos: [0.15, 1.55, -0.4], rot: [0.2, 0.9, -0.4], speed: 1.4 }
    ],
    []
  );

  // Position shifts smoothly depending on whether form is on left or right:
  // When login (form on left), wallet shifts right [1.1, 0, 0]
  // When signup (form on right), wallet shifts left [-1.1, 0, 0]
  const targetPosX = isSignup ? -1.15 : 1.15;
  const currentPos = useRef(new THREE.Vector3(1.15, 0, 0));

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();

    // Smoothly interpolate position X
    currentPos.current.x = THREE.MathUtils.lerp(
      currentPos.current.x,
      targetPosX,
      delta * 2.5
    );

    // Dynamic mouse parallax across entire screen
    const mouseX = state.pointer.x * 0.75;
    const mouseY = state.pointer.y * 0.55;

    if (rootGroupRef.current) {
      rootGroupRef.current.position.x = currentPos.current.x + mouseX * 0.35;
      rootGroupRef.current.position.y = mouseY * 0.25;
    }

    if (walletGroupRef.current) {
      // Base target Y rotation shifts smoothly with prominent mouse response
      const targetRotY = isSuccess
        ? 0
        : isSignup
        ? -0.45 + Math.sin(t * 0.7) * 0.2
        : 0.35 + Math.sin(t * 0.7) * 0.2;

      walletGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        walletGroupRef.current.rotation.y,
        targetRotY + mouseX * 0.9,
        delta * 4.5
      );
      walletGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        walletGroupRef.current.rotation.x,
        0.1 - mouseY * 0.7,
        delta * 4.5
      );

      // Camera/scale zoom on login success
      const targetScale = isSuccess ? 1.15 : 1;
      walletGroupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        delta * 4
      );
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.32;
      ring1Ref.current.rotation.x = Math.PI / 2.3 + Math.sin(t * 0.5) * 0.08;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.25;
      ring2Ref.current.rotation.y = Math.cos(t * 0.4) * 0.15;
    }

    if (coinsGroupRef.current) {
      coinsGroupRef.current.rotation.y = t * 0.18;
      coinsGroupRef.current.children.forEach((coin, idx) => {
        coin.rotation.y += delta * coinConfigs[idx].speed;
        coin.position.y =
          coinConfigs[idx].pos[1] + Math.sin(t * 1.8 + idx * 1.4) * 0.12;
      });
    }

    if (holoGroupRef.current) {
      const spread = isSuccess ? 1.35 : 1;
      holoGroupRef.current.scale.lerp(
        new THREE.Vector3(spread, spread, spread),
        delta * 3
      );
    }
  });

  return (
    <group ref={rootGroupRef} position={[currentPos.current.x, 0, 0]}>
      {/* Main Floating 3D Smart Wallet */}
      <Float
        speed={reducedMotion ? 0 : 2}
        rotationIntensity={reducedMotion ? 0 : 0.2}
        floatIntensity={reducedMotion ? 0 : 0.45}
      >
        <group ref={walletGroupRef}>
          {/* Outer Glossy Navy Wallet Body */}
          <RoundedBox args={[2.3, 1.45, 0.42]} radius={0.16} smoothness={4} castShadow receiveShadow>
            <meshPhysicalMaterial
              color="#0D172A"
              metalness={0.55}
              roughness={0.2}
              clearcoat={0.9}
              clearcoatRoughness={0.15}
              reflectivity={0.9}
            />
          </RoundedBox>

          {/* Inner Cyan Illuminated Trim Frame */}
          <RoundedBox args={[2.34, 1.48, 0.28]} radius={0.16} smoothness={4}>
            <meshStandardMaterial
              color="#22D3EE"
              emissive="#22D3EE"
              emissiveIntensity={0.45}
              metalness={0.8}
              roughness={0.2}
              wireframe={false}
            />
          </RoundedBox>

          {/* Front Flap Pocket */}
          <RoundedBox
            args={[2.18, 1.28, 0.12]}
            radius={0.12}
            smoothness={4}
            position={[0, -0.04, 0.2]}
          >
            <meshPhysicalMaterial
              color="#13203B"
              metalness={0.45}
              roughness={0.25}
              clearcoat={0.7}
            />
          </RoundedBox>

          {/* Metallic Clasp Strap with Glowing Cyan Core */}
          <RoundedBox
            args={[0.58, 0.34, 0.14]}
            radius={0.07}
            smoothness={4}
            position={[0.78, 0, 0.25]}
          >
            <meshStandardMaterial
              color="#1E293B"
              metalness={0.85}
              roughness={0.15}
            />
          </RoundedBox>
          <Cylinder
            args={[0.08, 0.08, 0.16, 24]}
            rotation={[Math.PI / 2, 0, 0]}
            position={[0.78, 0, 0.26]}
          >
            <meshStandardMaterial
              color="#22D3EE"
              emissive="#22D3EE"
              emissiveIntensity={1.4}
            />
          </Cylinder>

          {/* Embedded 3D Financial Chart Symbol on Front Left of Wallet */}
          <group position={[-0.55, -0.15, 0.28]}>
            {/* Bar 1 */}
            <RoundedBox args={[0.12, 0.28, 0.04]} radius={0.02} position={[-0.22, -0.08, 0]}>
              <meshStandardMaterial
                color="#22D3EE"
                emissive="#22D3EE"
                emissiveIntensity={0.8}
              />
            </RoundedBox>
            {/* Bar 2 */}
            <RoundedBox args={[0.12, 0.45, 0.04]} radius={0.02} position={[0, 0.0, 0]}>
              <meshStandardMaterial
                color="#34D399"
                emissive="#34D399"
                emissiveIntensity={0.8}
              />
            </RoundedBox>
            {/* Bar 3 */}
            <RoundedBox args={[0.12, 0.64, 0.04]} radius={0.02} position={[0.22, 0.09, 0]}>
              <meshStandardMaterial
                color="#8B5CF6"
                emissive="#8B5CF6"
                emissiveIntensity={0.9}
              />
            </RoundedBox>
          </group>

          {/* Emerging Holographic Credit/Finance Cards from Top of Wallet */}
          <group ref={holoGroupRef}>
            {/* Card 1 - Cyan Hologram */}
            <RoundedBox
              args={[1.45, 0.88, 0.03]}
              radius={0.06}
              position={[-0.25, 0.72, -0.02]}
              rotation={[0, 0, 0.08]}
            >
              <meshPhysicalMaterial
                color="#22D3EE"
                emissive="#22D3EE"
                emissiveIntensity={0.35}
                transparent
                opacity={0.78}
                roughness={0.1}
                metalness={0.3}
              />
            </RoundedBox>

            {/* Card 2 - Violet Hologram */}
            <RoundedBox
              args={[1.45, 0.88, 0.03]}
              radius={0.06}
              position={[0.28, 0.82, -0.1]}
              rotation={[0, 0, -0.1]}
            >
              <meshPhysicalMaterial
                color="#8B5CF6"
                emissive="#8B5CF6"
                emissiveIntensity={0.4}
                transparent
                opacity={0.72}
                roughness={0.15}
                metalness={0.4}
              />
            </RoundedBox>
          </group>
        </group>
      </Float>

      {/* Orbiting Rupee Gold/Cyan Coins */}
      <group ref={coinsGroupRef}>
        {coinConfigs.map((coin, index) => (
          <group key={index} position={coin.pos} rotation={coin.rot}>
            {/* Coin Disc */}
            <Cylinder args={[0.28, 0.28, 0.065, 32]}>
              <meshStandardMaterial
                color={index % 2 === 0 ? '#FBBF24' : '#22D3EE'}
                emissive={index % 2 === 0 ? '#FBBF24' : '#22D3EE'}
                emissiveIntensity={0.35}
                metalness={0.9}
                roughness={0.15}
              />
            </Cylinder>
            {/* Coin Inner Rim */}
            <Torus
              args={[0.21, 0.018, 12, 32]}
              rotation={[Math.PI / 2, 0, 0]}
              position={[0, 0.035, 0]}
            >
              <meshStandardMaterial color="#FFFFFF" metalness={0.9} roughness={0.1} />
            </Torus>
          </group>
        ))}
      </group>

      {/* Luminous Rotating Orbital Rings */}
      <Torus
        ref={ring1Ref}
        args={[2.25, 0.018, 16, 100]}
        rotation={[Math.PI / 2.2, 0.2, 0]}
      >
        <meshStandardMaterial
          color="#22D3EE"
          emissive="#22D3EE"
          emissiveIntensity={1.2}
          transparent
          opacity={0.75}
        />
      </Torus>

      <Torus
        ref={ring2Ref}
        args={[2.65, 0.012, 16, 100]}
        rotation={[Math.PI / 3, -0.35, 0]}
      >
        <meshStandardMaterial
          color="#8B5CF6"
          emissive="#8B5CF6"
          emissiveIntensity={1.1}
          transparent
          opacity={0.6}
        />
      </Torus>

      {/* Reflective Circular Pedestal Platform */}
      <group position={[0, -1.65, 0]}>
        <Cylinder args={[2.1, 2.3, 0.12, 64]}>
          <meshPhysicalMaterial
            color="#0B1325"
            metalness={0.8}
            roughness={0.15}
            clearcoat={1}
          />
        </Cylinder>
        {/* Glowing Platform Ring */}
        <Torus
          args={[2.12, 0.025, 16, 64]}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0.06, 0]}
        >
          <meshStandardMaterial
            color="#22D3EE"
            emissive="#22D3EE"
            emissiveIntensity={1.5}
          />
        </Torus>
      </group>

      {/* Floating Ambient Particles */}
      {!reducedMotion && (
        <Sparkles
          count={45}
          scale={5.5}
          size={2.2}
          speed={0.4}
          opacity={0.65}
          color="#22D3EE"
        />
      )}
    </group>
  );
}

export default function WalletScene({
  isSignup = false,
  isSuccess = false,
  reducedMotion = false
}) {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-auto select-none overflow-hidden z-0">
      {/* Ambient Radial Backglow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className={`w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full blur-[130px] transition-all duration-1000 ${
            isSignup
              ? 'bg-gradient-to-tr from-[#8B5CF6]/25 to-[#22D3EE]/20 translate-x-[-15%]'
              : 'bg-gradient-to-tr from-[#22D3EE]/25 to-[#8B5CF6]/20 translate-x-[15%]'
          }`}
        />
      </div>

      <Canvas
        camera={{ position: [0, 0.2, 5.8], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[5, 7, 5]} intensity={1.8} color="#F8FAFC" />
        <pointLight position={[-4, 3, 4]} intensity={2.6} color="#22D3EE" distance={12} />
        <pointLight position={[4, -2, 3]} intensity={2.4} color="#8B5CF6" distance={12} />
        <WalletObject
          isSignup={isSignup}
          isSuccess={isSuccess}
          reducedMotion={reducedMotion}
        />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          dampingFactor={0.06}
          enableDamping={true}
          rotateSpeed={0.8}
          minDistance={3.5}
          maxDistance={8.5}
          maxPolarAngle={Math.PI / 1.65}
          minPolarAngle={Math.PI / 3.8}
        />
      </Canvas>
    </div>
  );
}
