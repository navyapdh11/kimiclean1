'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { useState, useRef, Suspense, Component, ReactNode } from 'react';

interface ParticleSwarmProps {
  particleCount?: number;
  color?: string;
  radius?: number;
  rotationSpeed?: [number, number];
  className?: string;
}

// Error boundary for WebGL failures
class WebGLErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

function ParticleField({
  count = 6000,
  color = '#3b82f6',
  radius = 1.5,
  rotationSpeed = [15, 20],
}: {
  count?: number;
  color?: string;
  radius?: number;
  rotationSpeed?: [number, number];
}) {
  const ref = useRef<any>(null);
  const { invalidate } = useFrame((state) => state);

  const sphere = useState(() =>
    random.inSphere(new Float32Array(count * 3), { radius })
  )[0];

  useFrame((state, delta) => {
    if (!ref.current) return;

    ref.current.rotation.x -= delta / rotationSpeed[0];
    ref.current.rotation.y -= delta / rotationSpeed[1];

    // Manual invalidate for on-demand rendering
    invalidate();
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={ref}
        positions={sphere}
        stride={3}
        frustumCulled={true}
      >
        <PointMaterial
          transparent
          color={color}
          size={0.004}
          sizeAttenuation={true}
          depthWrite={false}
          blending={2}
          opacity={0.8}
        />
      </Points>
    </group>
  );
}

export default function ParticleSwarm({
  particleCount = 6000,
  color = '#3b82f6',
  radius = 1.5,
  rotationSpeed = [15, 20],
  className = '',
}: ParticleSwarmProps) {
  return (
    <div className={`fixed inset-0 -z-10 pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 60 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <WebGLErrorBoundary>
            <ParticleField
              count={particleCount}
              color={color}
              radius={radius}
              rotationSpeed={rotationSpeed}
            />
          </WebGLErrorBoundary>
        </Suspense>
      </Canvas>
    </div>
  );
}
