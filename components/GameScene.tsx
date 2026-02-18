
import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

interface GameSceneProps {
  gameState: string;
  onUpdate: (speed: number, distance: number) => void;
  onCrash: () => void;
}

const TRACK_LENGTH = 1000;
const TRACK_WIDTH = 12;

const Road = ({ speed }: { speed: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value += delta * speed * 20;
    }
  });

  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#050510") },
      uGridColor: { value: new THREE.Color("#00f3ff") }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      uniform vec3 uGridColor;
      varying vec2 vUv;
      void main() {
        vec2 grid = abs(fract(vUv * vec2(10.0, 100.0) - vec2(0.0, uTime)) - 0.5) / fwidth(vUv * vec2(10.0, 100.0));
        float line = min(grid.x, grid.y);
        float colorMask = 1.0 - min(line, 1.0);
        vec3 finalColor = mix(uColor, uGridColor, colorMask * 0.4);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  }), []);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[TRACK_WIDTH, TRACK_LENGTH, 1, 1]} />
      <shaderMaterial args={[shaderArgs]} />
    </mesh>
  );
};

const Bike = ({ speed, laneX, rotationZ }: { speed: number, laneX: number, rotationZ: number }) => {
  return (
    <group position={[laneX, 0.5, 5]} rotation={[0, 0, rotationZ]}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[0.4, 0.6, 1.5]} />
        <meshStandardMaterial color="#111" roughness={0.1} metalness={1} />
      </mesh>
      {/* Neon Accents */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.45, 0.1, 1.6]} />
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={5} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.4, 0.4]} rotation={[-0.5, 0, 0]}>
        <planeGeometry args={[0.3, 0.4]} />
        <meshPhysicalMaterial color="#00f3ff" transparent opacity={0.6} transmission={1} thickness={1} />
      </mesh>
      {/* Wheels */}
      <mesh position={[0, -0.2, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#050505" />
      </mesh>
      <mesh position={[0, -0.2, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#050505" />
      </mesh>
      
      {/* Light Trail */}
      <mesh position={[0, -0.2, -2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, 3]} />
        <meshBasicMaterial color="#ff00ff" transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

// New Traffic System
type TrafficType = 'BIKE' | 'CAR' | 'TRUCK';

interface TrafficObstacle {
  type: TrafficType;
  x: number;
  z: number;
  speedMod: number; // Speed relative to the road
  id: number;
  color: string;
}

const TrafficVehicle = ({ type, color }: { type: TrafficType, color: string }) => {
  if (type === 'TRUCK') {
    return (
      <group>
        {/* Main Body */}
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[2.5, 3, 7]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        {/* Cab */}
        <mesh position={[0, 1.2, 3.8]}>
          <boxGeometry args={[2.4, 2.4, 1.5]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        {/* Headlights */}
        <mesh position={[-0.8, 0.8, 4.5]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={5} />
        </mesh>
        <mesh position={[0.8, 0.8, 4.5]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={5} />
        </mesh>
        <pointLight position={[0, 1, 5]} color="white" intensity={2} distance={10} />
      </group>
    );
  }
  if (type === 'CAR') {
    return (
      <group>
        {/* Chassis */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.8, 0.8, 3.5]} />
          <meshStandardMaterial color={color} roughness={0.1} metalness={0.8} />
        </mesh>
        {/* Top */}
        <mesh position={[0, 1.1, -0.2]}>
          <boxGeometry args={[1.4, 0.6, 1.8]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        {/* Tail lights */}
        <mesh position={[-0.6, 0.6, -1.8]}>
          <boxGeometry args={[0.4, 0.2, 0.1]} />
          <meshStandardMaterial color="red" emissive="red" emissiveIntensity={4} />
        </mesh>
        <mesh position={[0.6, 0.6, -1.8]}>
          <boxGeometry args={[0.4, 0.2, 0.1]} />
          <meshStandardMaterial color="red" emissive="red" emissiveIntensity={4} />
        </mesh>
        <pointLight position={[0, 0.5, -2]} color="red" intensity={1} distance={5} />
      </group>
    );
  }
  // Bike Obstacle
  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.5, 0.8, 1.8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      <pointLight color={color} intensity={2} distance={4} />
    </group>
  );
};

const Obstacles = ({ speed, onCollision }: { speed: number, onCollision: () => void }) => {
  const [traffic, setTraffic] = useState<TrafficObstacle[]>([]);
  const trafficRefs = useRef<{ [key: number]: THREE.Group | null }>({});
  
  // Initialize traffic
  useEffect(() => {
    const initialTraffic: TrafficObstacle[] = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      type: (['BIKE', 'CAR', 'TRUCK'] as TrafficType[])[Math.floor(Math.random() * 3)],
      x: (Math.random() - 0.5) * (TRACK_WIDTH - 2),
      z: -40 - i * 35,
      speedMod: 0.1 + Math.random() * 0.4,
      color: ['#00ff00', '#ffff00', '#ff0000', '#0000ff', '#ffffff'][Math.floor(Math.random() * 5)]
    }));
    setTraffic(initialTraffic);
  }, []);

  useFrame((state, delta) => {
    setTraffic(prev => prev.map(obs => {
      // Traffic moves based on road speed + its own speed relative to road
      // Some traffic comes towards you, some goes away. 
      // If speedMod > 0, it's moving "forward" (away from you slower than road)
      // If speedMod < 0, it's coming "towards" you
      let nextZ = obs.z + speed * 50 * delta;
      let nextX = obs.x;

      // Handle Lane changes for AI
      if (Math.random() < 0.01) {
        nextX += (Math.random() - 0.5) * 0.5;
      }
      nextX = Math.max(Math.min(nextX, TRACK_WIDTH/2 - 1.5), -TRACK_WIDTH/2 + 1.5);

      // Reset when behind player
      if (nextZ > 15) {
        nextZ = -150 - Math.random() * 100;
        nextX = (Math.random() - 0.5) * (TRACK_WIDTH - 2);
        const type = (['BIKE', 'CAR', 'TRUCK'] as TrafficType[])[Math.floor(Math.random() * 3)];
        return { ...obs, z: nextZ, x: nextX, type };
      }

      // Collision Detection with AABB (Box-based)
      const playerX = state.camera.position.x;
      const playerZ = 5;
      const playerW = 0.5; // Hitbox width
      const playerL = 1.5; // Hitbox length

      let obsW = 0.8;
      let obsL = 2.0;
      if (obs.type === 'CAR') { obsW = 1.8; obsL = 3.5; }
      if (obs.type === 'TRUCK') { obsW = 2.6; obsL = 7.5; }

      const xDist = Math.abs(playerX - obs.x);
      const zDist = Math.abs(playerZ - nextZ);

      if (xDist < (playerW + obsW) / 2 && zDist < (playerL + obsL) / 2) {
        onCollision();
      }

      return { ...obs, z: nextZ, x: nextX };
    }));
  });

  return (
    <group>
      {traffic.map((obs) => (
        <group 
          key={obs.id} 
          ref={el => trafficRefs.current[obs.id] = el} 
          position={[obs.x, 0, obs.z]}
        >
          <TrafficVehicle type={obs.type} color={obs.color} />
        </group>
      ))}
    </group>
  );
};

const GameEngine = ({ gameState, onUpdate, onCrash }: GameSceneProps) => {
  const [speed, setSpeed] = useState(0);
  const [laneX, setLaneX] = useState(0);
  const [rotZ, setRotZ] = useState(0);
  const distance = useRef(0);
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => keys.current[e.key.toLowerCase()] = true;
    const handleUp = (e: KeyboardEvent) => keys.current[e.key.toLowerCase()] = false;
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (gameState !== 'RACING') return;

    // Movement Logic
    // Faster max speed for difficulty
    const isBoosting = keys.current[' '];
    const baseTargetSpeed = keys.current['w'] || keys.current['arrowup'] ? 1.0 : 0.5;
    const accel = isBoosting ? 1.8 : 1.0;
    
    setSpeed(s => THREE.MathUtils.lerp(s, baseTargetSpeed * accel, delta * 1.5));
    
    let targetX = laneX;
    let targetRot = 0;
    // More responsive steering for dodging
    const steerSpeed = 20 * (speed + 0.2); 
    if (keys.current['a'] || keys.current['arrowleft']) {
        targetX -= delta * steerSpeed;
        targetRot = 0.4;
    }
    if (keys.current['d'] || keys.current['arrowright']) {
        targetX += delta * steerSpeed;
        targetRot = -0.4;
    }
    
    // Bounds check
    const boundedX = Math.max(Math.min(targetX, TRACK_WIDTH/2 - 0.8), -TRACK_WIDTH/2 + 0.8);
    setLaneX(boundedX);
    setRotZ(r => THREE.MathUtils.lerp(r, targetRot, delta * 8));

    distance.current += speed * delta * 150;
    onUpdate(speed, distance.current);

    // Dynamic Camera
    const camTargetX = boundedX * 0.5;
    const camTargetY = 3 + (speed * 2);
    const camTargetZ = 12 + (speed * 4);
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, camTargetX, delta * 3);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, camTargetY, delta * 3);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, camTargetZ, delta * 3);
    state.camera.lookAt(boundedX, 1, -15);
  });

  return (
    <>
      <color attach="background" args={["#020205"]} />
      <fog attach="fog" args={["#020205", 10, 80]} />
      
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00f3ff" />
      <pointLight position={[-10, 5, 5]} intensity={1} color="#ff00ff" />

      <Road speed={speed} />
      <Bike speed={speed} laneX={laneX} rotationZ={rotZ} />
      <Obstacles speed={speed} onCollision={onCrash} />

      <Stars radius={150} depth={60} count={7000} factor={6} saturation={0.5} fade speed={2} />
      <PerspectiveCamera makeDefault position={[0, 4, 15]} fov={65} />
      
      {/* Cityscape Atmosphere */}
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[
            (i % 2 === 0 ? 1 : -1) * (18 + Math.random() * 30), 
            Math.random() * 15, 
            -Math.random() * 200
          ]}
        >
          <boxGeometry args={[Math.random() * 5 + 2, Math.random() * 40 + 10, Math.random() * 5 + 2]} />
          <meshStandardMaterial 
            color={i % 3 === 0 ? "#111" : "#050505"} 
            emissive={i % 5 === 0 ? "#00f3ff" : "black"} 
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </>
  );
};

const GameScene: React.FC<GameSceneProps> = (props) => {
  return (
    <div className="w-full h-full">
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          <GameEngine {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GameScene;
