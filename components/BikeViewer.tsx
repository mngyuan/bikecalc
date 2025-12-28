import React, {useRef} from 'react';
import * as THREE from 'three';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';

// const radToDeg = (rad: number) => (rad * 180) / Math.PI;
const degToRad = (deg: number) => (deg * Math.PI) / 180;

const FRAME_COLOR = '#92b983';
const WHEEL_COLOR = '#1a1a1a';

// Frame geometry based on 520mm cross check frame (all measurements converted to meters)
const GEOMETRY = {
  seatTube: 0.52,
  seatAngle: 73.5,
  topTube: 0.5451,
  headTube: 0.091,
  headAngle: 72,
  wheelbase: 1.0059,
  chainstay: 0.425,
  bbDrop: 0.066,
  reach: 0.3897,
  stack: 0.528,
  crankLength: 0.17,
  forkLength: 0.4,
  forkRake: 0.044,
  frontOLD: 0.1,
  rearOLD: 0.1325,
};
const GUESTIMATES = {
  chainstayAngleFromRearHub: 5,
  topTubeFromBBVert:
    Math.sin(degToRad(GEOMETRY.seatAngle)) * GEOMETRY.seatTube -
    GEOMETRY.bbDrop,
};

// Convert degrees to radians
const seatAngleRad = (GEOMETRY.seatAngle * Math.PI) / 180;
const headAngleRad = (GEOMETRY.headAngle * Math.PI) / 180;

// 700C 35C tires by default
const WHEEL_RADIUS = 0.622 / 2;
const TIRE_RADIUS = 0.035 / 2;
const CRANK_TUBE_RADIUS = 0.0125; // ~25mm diameter tubes
const TUBE_RADIUS_STAYS = 0.016 / 2;
const TUBE_RADIUS_FRAME = 0.0286 / 2;
const TUBE_RADIUS_HEADTUBE = 0.036 / 2;
// should be derived from teeth
const CHAINRING_RADIUS = 0.1;

function Bicycle({cadenceRPM = 80}: {cadenceRPM?: number}) {
  const crankRef = useRef<THREE.Group>(null);
  const frontWheelRef = useRef<THREE.Group>(null);
  const rearWheelRef = useRef<THREE.Group>(null);

  // Calculate fork curve points
  // Start point: bottom of headtube
  const forkStartX =
    GEOMETRY.chainstay +
    GEOMETRY.reach +
    Math.cos(headAngleRad) * GEOMETRY.headTube;
  const forkStartY = GUESTIMATES.topTubeFromBBVert - GEOMETRY.bbDrop;

  // End point: front hub
  const forkEndX = GEOMETRY.wheelbase;
  const forkEndY = 0;

  // Control point: along head angle to make fork initially follow the head angle
  const controlDistance = GEOMETRY.forkLength * 0.6;
  const controlX = forkStartX - Math.cos(headAngleRad) * controlDistance + 0.14; // magic number
  const controlY = forkStartY - Math.sin(headAngleRad) * controlDistance;

  // Create fork curves for left and right blades
  const forkCurveLeft = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(
      forkStartX,
      forkStartY,
      GEOMETRY.frontOLD / 2 - TUBE_RADIUS_FRAME,
    ),
    new THREE.Vector3(
      controlX,
      controlY,
      GEOMETRY.frontOLD / 2 - TUBE_RADIUS_FRAME,
    ),
    new THREE.Vector3(
      forkEndX,
      forkEndY,
      GEOMETRY.frontOLD / 2 - TUBE_RADIUS_FRAME,
    ),
  );

  const forkCurveRight = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(
      forkStartX,
      forkStartY,
      -GEOMETRY.frontOLD / 2 + TUBE_RADIUS_FRAME,
    ),
    new THREE.Vector3(
      controlX,
      controlY,
      -GEOMETRY.frontOLD / 2 + TUBE_RADIUS_FRAME,
    ),
    new THREE.Vector3(
      forkEndX,
      forkEndY,
      -GEOMETRY.frontOLD / 2 + TUBE_RADIUS_FRAME,
    ),
  );

  useFrame((state, delta) => {
    if (crankRef.current) {
      crankRef.current.rotation.z -= (cadenceRPM * 2 * Math.PI * delta) / 60;
    }
    // TODO: Rotate wheels based on gear ratio and cadence
    if (frontWheelRef.current) {
      frontWheelRef.current.rotation.z -=
        (cadenceRPM * 2 * Math.PI * delta) / 60;
    }
    if (rearWheelRef.current) {
      rearWheelRef.current.rotation.z -=
        (cadenceRPM * 2 * Math.PI * delta) / 60;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Rear wheel at origin */}
      <group ref={rearWheelRef} position={[0, WHEEL_RADIUS, 0]}>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry
            args={[WHEEL_RADIUS + TIRE_RADIUS, TIRE_RADIUS, 16, 32]}
          />
          <meshStandardMaterial color={WHEEL_COLOR} />
        </mesh>
        {/* Spokes */}
        {[...Array(16)].map((_, i) => (
          <mesh
            key={i}
            rotation={[0, 0, (i * Math.PI) / 8]}
            position={[0, 0, 0]}
          >
            <cylinderGeometry args={[0.002, 0.002, WHEEL_RADIUS * 2, 8]} />
            <meshStandardMaterial color="#666" />
          </mesh>
        ))}
      </group>

      {/* Front wheel at wheelbase distance */}
      <group
        ref={frontWheelRef}
        position={[GEOMETRY.wheelbase, WHEEL_RADIUS, 0]}
      >
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry
            args={[WHEEL_RADIUS + TIRE_RADIUS, TIRE_RADIUS, 16, 32]}
          />
          <meshStandardMaterial color={WHEEL_COLOR} />
        </mesh>
        {/* Spokes */}
        {[...Array(16)].map((_, i) => (
          <mesh
            key={i}
            rotation={[0, 0, (i * Math.PI) / 8]}
            position={[0, 0, 0]}
          >
            <cylinderGeometry args={[0.002, 0.002, WHEEL_RADIUS * 2, 8]} />
            <meshStandardMaterial color="#666" />
          </mesh>
        ))}
      </group>

      {/* Cranks at BB (430mm from rear dropout per geometry chart) */}
      <group
        ref={crankRef}
        position={[0.43, WHEEL_RADIUS - GEOMETRY.bbDrop, 0]}
      >
        {/* Left crank arm */}
        <mesh rotation={[0, 0, 0]}>
          <cylinderGeometry
            args={[
              CRANK_TUBE_RADIUS * 0.8,
              CRANK_TUBE_RADIUS * 0.8,
              GEOMETRY.crankLength,
              8,
            ]}
          />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Right crank arm */}
        <mesh rotation={[0, 0, Math.PI]}>
          <cylinderGeometry
            args={[
              CRANK_TUBE_RADIUS * 0.8,
              CRANK_TUBE_RADIUS * 0.8,
              GEOMETRY.crankLength,
              8,
            ]}
          />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Pedals */}
        <mesh position={[0, GEOMETRY.crankLength / 2, 0]}>
          <boxGeometry args={[0.08, 0.015, 0.025]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        <mesh position={[0, -GEOMETRY.crankLength / 2, 0]}>
          <boxGeometry args={[0.08, 0.015, 0.025]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        {/* Chainring */}
        <mesh rotation={[0, 0, 0]} position={[0, 0, 0.02]}>
          <torusGeometry args={[CHAINRING_RADIUS, 0.003, 16, 32]} />
          <meshStandardMaterial color="#888" />
        </mesh>
      </group>

      {/* Simple frame representation */}
      <group position={[0, WHEEL_RADIUS, 0]}>
        {/* Chain stays */}
        <mesh
          position={[
            GEOMETRY.chainstay / 2,
            -GEOMETRY.bbDrop / 2,
            GEOMETRY.rearOLD / 2 / 2,
          ]}
          rotation={[
            0,
            degToRad(GUESTIMATES.chainstayAngleFromRearHub),
            Math.atan2(
              -GEOMETRY.chainstay,
              -GEOMETRY.bbDrop / 2 - TUBE_RADIUS_STAYS * 2,
            ),
          ]}
        >
          <cylinderGeometry
            args={[
              TUBE_RADIUS_STAYS,
              TUBE_RADIUS_STAYS,
              GEOMETRY.chainstay /
                Math.cos(degToRad(GUESTIMATES.chainstayAngleFromRearHub)),
              8,
            ]}
          />
          <meshStandardMaterial color={FRAME_COLOR} />
        </mesh>
        <mesh
          position={[
            GEOMETRY.chainstay / 2,
            -GEOMETRY.bbDrop / 2,
            -GEOMETRY.rearOLD / 2 / 2,
          ]}
          rotation={[
            0,
            degToRad(-GUESTIMATES.chainstayAngleFromRearHub),
            Math.atan2(
              -GEOMETRY.chainstay,
              -GEOMETRY.bbDrop / 2 - TUBE_RADIUS_STAYS * 2,
            ),
          ]}
        >
          <cylinderGeometry
            args={[
              TUBE_RADIUS_STAYS,
              TUBE_RADIUS_STAYS,
              GEOMETRY.chainstay /
                Math.cos(degToRad(-GUESTIMATES.chainstayAngleFromRearHub)),
              8,
            ]}
          />
          <meshStandardMaterial color={FRAME_COLOR} />
        </mesh>

        {/* Seat tube */}
        <mesh
          position={[
            GEOMETRY.chainstay - CHAINRING_RADIUS + TUBE_RADIUS_FRAME,
            GEOMETRY.seatTube / 2 - GEOMETRY.bbDrop,
            0,
          ]}
          rotation={[0, 0, Math.PI / 2 - seatAngleRad]}
        >
          <cylinderGeometry
            args={[TUBE_RADIUS_FRAME, TUBE_RADIUS_FRAME, GEOMETRY.seatTube, 8]}
          />
          <meshStandardMaterial color={FRAME_COLOR} />
        </mesh>

        {/* Seat stay */}
        <mesh
          position={[
            // halfway between rear wheel axle (0,0,0) and top of seat tube
            // + small offset to account for tube radius
            // guestimate chainstay angle? this is clearly wrong but it happens
            // to be a magic value which works
            (Math.cos(degToRad(50)) * GEOMETRY.chainstay) / 2,
            GEOMETRY.seatTube / 2 - GEOMETRY.bbDrop + TUBE_RADIUS_STAYS,
            GEOMETRY.rearOLD / 2 / 2,
          ]}
          rotation={[
            0,
            degToRad(GUESTIMATES.chainstayAngleFromRearHub + 3),
            -Math.atan2(
              // angle between rear axle and top of seat tube
              GEOMETRY.seatTube / 2 - GEOMETRY.bbDrop,
              GEOMETRY.chainstay - CHAINRING_RADIUS + TUBE_RADIUS_FRAME,
            ),
          ]}
        >
          <cylinderGeometry
            args={[TUBE_RADIUS_STAYS, TUBE_RADIUS_STAYS, GEOMETRY.seatTube, 8]}
          />
          <meshStandardMaterial color={FRAME_COLOR} />
        </mesh>
        <mesh
          position={[
            // halfway between rear wheel axle (0,0,0) and top of seat tube
            // + small offset to account for tube radius
            // guestimate chainstay angle? this is clearly wrong but it happens
            // to be a magic value which works
            (Math.cos(degToRad(50)) * GEOMETRY.chainstay) / 2,
            GEOMETRY.seatTube / 2 - GEOMETRY.bbDrop + TUBE_RADIUS_STAYS,
            -GEOMETRY.rearOLD / 2 / 2,
          ]}
          rotation={[
            0,
            degToRad(-GUESTIMATES.chainstayAngleFromRearHub - 3),
            -Math.atan2(
              // angle between rear axle and top of seat tube
              GEOMETRY.seatTube / 2 - GEOMETRY.bbDrop,
              GEOMETRY.chainstay - CHAINRING_RADIUS + TUBE_RADIUS_FRAME,
            ),
          ]}
        >
          <cylinderGeometry
            args={[TUBE_RADIUS_STAYS, TUBE_RADIUS_STAYS, GEOMETRY.seatTube, 8]}
          />
          <meshStandardMaterial color={FRAME_COLOR} />
        </mesh>

        {/* Top tube */}
        <mesh
          position={[GEOMETRY.topTube, GUESTIMATES.topTubeFromBBVert, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry
            args={[TUBE_RADIUS_FRAME, TUBE_RADIUS_FRAME, GEOMETRY.topTube, 8]}
          />
          <meshStandardMaterial color={FRAME_COLOR} />
        </mesh>

        {/* Down tube */}
        <mesh
          position={[
            GEOMETRY.chainstay / 2 +
              GEOMETRY.topTube -
              Math.cos(seatAngleRad) * GEOMETRY.seatTube +
              TUBE_RADIUS_FRAME,
            GUESTIMATES.topTubeFromBBVert / 2 -
              GEOMETRY.bbDrop / 2 -
              TUBE_RADIUS_FRAME,
            0,
          ]}
          rotation={[
            0,
            0,
            -Math.atan2(
              GUESTIMATES.topTubeFromBBVert - GEOMETRY.bbDrop,
              GEOMETRY.reach,
            ),
          ]}
        >
          <cylinderGeometry
            args={[
              TUBE_RADIUS_FRAME,
              TUBE_RADIUS_FRAME,
              (GEOMETRY.stack - Math.sin(headAngleRad) * GEOMETRY.headTube) /
                Math.sin(degToRad(45)),
              8,
            ]}
          />
          <meshStandardMaterial color={FRAME_COLOR} />
        </mesh>

        {/* Head tube */}
        <mesh
          position={[
            GEOMETRY.chainstay +
              GEOMETRY.reach +
              (Math.cos(headAngleRad) * GEOMETRY.headTube) / 2,
            GUESTIMATES.topTubeFromBBVert -
              GEOMETRY.bbDrop +
              (Math.sin(headAngleRad) * GEOMETRY.headTube) / 2,
            0,
          ]}
          rotation={[0, 0, Math.PI / 2 - headAngleRad]}
        >
          <cylinderGeometry
            args={[
              TUBE_RADIUS_HEADTUBE,
              TUBE_RADIUS_HEADTUBE,
              GEOMETRY.headTube,
              8,
            ]}
          />
          <meshStandardMaterial color={FRAME_COLOR} />
        </mesh>

        {/* Fork - curved blades with rake */}
        <mesh>
          <tubeGeometry
            args={[forkCurveLeft, 20, TUBE_RADIUS_FRAME, 8, false]}
          />
          <meshStandardMaterial color={FRAME_COLOR} />
        </mesh>
        <mesh>
          <tubeGeometry
            args={[forkCurveRight, 20, TUBE_RADIUS_FRAME, 8, false]}
          />
          <meshStandardMaterial color={FRAME_COLOR} />
        </mesh>
        {/* Fork crown */}
        <mesh
          position={[forkStartX, forkStartY - TUBE_RADIUS_FRAME, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry
            args={[TUBE_RADIUS_FRAME, TUBE_RADIUS_FRAME, GEOMETRY.frontOLD, 8]}
          />
          <meshStandardMaterial color={FRAME_COLOR} />
        </mesh>

        {/* Rear axle */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.005, 0.005, GEOMETRY.rearOLD, 8]} />
          <meshStandardMaterial color="#666" />
        </mesh>

        {/* Front axle */}
        <mesh
          position={[GEOMETRY.wheelbase, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.005, 0.005, GEOMETRY.frontOLD, 8]} />
          <meshStandardMaterial color="#666" />
        </mesh>
      </group>
    </group>
  );
}

function CameraLogger() {
  const {camera} = useThree();
  console.log(camera.toJSON());

  useFrame(() => {
    // Logs on every frame - comment out when not needed
    // console.log('Camera position:', camera.position.toArray());
  });

  return null;
}

function Scene({cadenceRPM = 80}: {cadenceRPM?: number}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 2, 2]} intensity={0.8} />
      <directionalLight position={[-2, 1, -2]} intensity={0.3} />
      <Bicycle cadenceRPM={cadenceRPM} />
      <OrbitControls enableZoom={true} enablePan={true} />
      <CameraLogger />
    </>
  );
}

// Main component
const BikeViewer = ({
  className,
  cadenceRPM = 80,
}: {
  className?: string;
  cadenceRPM?: number;
}) => {
  return (
    <div className={className}>
      <Canvas camera={{position: [1.25, 0.5, 7.5], fov: 50}}>
        <Scene cadenceRPM={cadenceRPM} />
      </Canvas>
    </div>
  );
};

export default BikeViewer;
