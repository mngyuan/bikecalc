import React, {useRef} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {useState} from 'react';

// Simple bike model made with basic shapes
function Bicycle({onClick}: {onClick: () => void}) {
  const frame = useRef();

  return (
    <group ref={frame} position={[0, 0, 0]} onClick={onClick}>
      {/* Frame */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[2, 0.1, 0.1]} />
        <meshStandardMaterial color="red" />
      </mesh>

      {/* Seat post */}
      <mesh position={[0.8, 1.3, 0]}>
        <boxGeometry args={[0.1, 0.6, 0.1]} />
        <meshStandardMaterial color="red" />
      </mesh>

      {/* Front wheel */}
      <mesh position={[-0.8, 0.5, 0]}>
        <torusGeometry args={[0.5, 0.05, 16, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* Back wheel */}
      <mesh position={[0.8, 0.5, 0]}>
        <torusGeometry args={[0.5, 0.05, 16, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* Handlebars */}
      <mesh position={[-0.8, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6]} />
        <meshStandardMaterial color="silver" />
      </mesh>
    </group>
  );
}

function Scene() {
  const [cameraPosition, setCameraPosition] = useState([5, 3, 5]);
  const {camera} = useThree();

  useFrame(() => {
    camera.position.lerp(
      {x: cameraPosition[0], y: cameraPosition[1], z: cameraPosition[2]},
      0.05,
    );
    camera.lookAt(0, 0, 0);
  });

  const positions = [
    [5, 3, 5], // Front right
    [-5, 3, 5], // Front left
    [0, 5, 5], // Top front
    [0, 3, -5], // Back
  ];

  const [currentPosition, setCurrentPosition] = useState(0);

  const changeView = () => {
    const nextPosition = (currentPosition + 1) % positions.length;
    setCurrentPosition(nextPosition);
    setCameraPosition(positions[nextPosition]);
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Bicycle onClick={changeView} />
      <OrbitControls enableZoom={true} enablePan={false} />
    </>
  );
}

// Main component
const BikeViewer = ({className}: {className?: string}) => {
  return (
    <div className={className}>
      <Canvas>
        <Scene />
      </Canvas>
    </div>
  );
};

export default BikeViewer;
