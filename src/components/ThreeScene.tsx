
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

function MountainRidge() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const vertices = useMemo(() => {
    const verts = [];
    const size = 50;
    const segments = 64;
    
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const x = (i / segments - 0.5) * size;
        const z = (j / segments - 0.5) * size;
        
        // Create mountain-like terrain
        const distance = Math.sqrt(x * x + z * z);
        const height = Math.max(0, 8 - distance * 0.3) + 
                      Math.sin(x * 0.1) * 2 + 
                      Math.cos(z * 0.1) * 2 +
                      Math.random() * 0.5;
        
        verts.push(x, height, z);
      }
    }
    return new Float32Array(verts);
  }, []);

  const indices = useMemo(() => {
    const idx = [];
    const segments = 64;
    
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        const a = i * (segments + 1) + j;
        const b = a + 1;
        const c = a + segments + 1;
        const d = c + 1;
        
        idx.push(a, b, c);
        idx.push(b, d, c);
      }
    }
    return idx;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -15, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach='attributes-position'
          count={vertices.length / 3}
          array={vertices}
          itemSize={3}
        />
        <bufferAttribute
          attach='index'
          array={new Uint16Array(indices)}
          itemSize={1}
        />
      </bufferGeometry>
      <meshLambertMaterial 
        color="#0891b2" 
        wireframe={false}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function FloatingLogo() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Text
        position={[0, 5, 0]}
        fontSize={3}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
        font="/fonts/orbitron-bold.woff"
      >
        CYCLETRACK
      </Text>
      <Text
        position={[0, 2, 0]}
        fontSize={1.2}
        color="#0891b2"
        anchorX="center"
        anchorY="middle"
      >
        PRO
      </Text>
    </Float>
  );
}

interface ThreeSceneProps {
  className?: string;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ className = '' }) => {
  return (
    <div className={`${className}`}>
      <Canvas camera={{ position: [0, 10, 30], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} color="#10b981" intensity={0.5} />
        
        <MountainRidge />
        <FloatingLogo />
        
        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
