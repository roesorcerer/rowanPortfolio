import * as THREE from 'three';
import React, { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Update the path to your animation file
const CHARACTER_URL = '/models/animations/Walking (1).gltf';

type GLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.SkinnedMesh;
  };
  materials: {
    [key: string]: THREE.MeshStandardMaterial;
  };
  animations: THREE.AnimationClip[];
};

export function Character(props: JSX.IntrinsicElements['group']) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(CHARACTER_URL) as GLTFResult;
  const { actions } = useAnimations(animations, group);

  // Set up materials and lighting
  useEffect(() => {
    if (scene) {
      // Traverse all meshes in the scene
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Enable shadows
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Adjust material properties
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.roughness = 0.5;
            child.material.metalness = 0.1;
            child.material.envMapIntensity = 1;
          }
        }
      });
    }
  }, [scene]);

  // Animation sequence
  useGSAP(() => {
    if (group.current) {
      // Initial position outside the shop (in local coordinates)
      group.current.position.set(10, 0, 5);
      group.current.rotation.y = -Math.PI / 2;
      
      // Scale down the model more
      scene.scale.set(0.01, 0.01, 0.01);

      // Create timeline for the entire sequence
      const tl = gsap.timeline();

      // Log available animations
      console.log('Available animations:', Object.keys(actions));

      // Walk into the shop
      tl.to(group.current.position, {
        x: 5,
        z: 5,
        duration: 3,
        ease: "power1.inOut",
        onStart: () => {
          // Try different animation names
          const walkAnim = actions['Walking'] || actions['walk'] || actions['Walk'] || Object.values(actions)[0];
          if (walkAnim) {
            walkAnim.play();
            walkAnim.setEffectiveTimeScale(1.2);
          } else {
            console.warn('No walking animation found. Available animations:', Object.keys(actions));
          }
        }
      })
      // Pause briefly at the entrance
      .to({}, { duration: 0.5 })
      // Turn to face the bar
      .to(group.current.rotation, {
        y: 0,
        duration: 0.5,
        ease: "power1.inOut"
      })
      // Walk to the bar
      .to(group.current.position, {
        x: 0,
        z: 2,
        duration: 2,
        ease: "power1.inOut"
      })
      // Turn to sit
      .to(group.current.rotation, {
        y: Math.PI / 2,
        duration: 0.5,
        ease: "power1.inOut"
      })
      // Sit down
      .to(group.current.position, {
        y: 0.2,
        duration: 0.5,
        ease: "power1.inOut",
        onComplete: () => {
          // Stop walking animation
          const walkAnim = actions['Walking'] || actions['walk'] || actions['Walk'] || Object.values(actions)[0];
          if (walkAnim) {
            walkAnim.stop();
          }
        }
      });
    }
  }, []);

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(CHARACTER_URL); 