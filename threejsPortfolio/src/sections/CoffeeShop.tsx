import React from 'react'
import { useLoader } from "@react-three/fiber";
import { Texture } from "three/src/textures/Texture.js";
import texture from "../public/textures/Wood_baseColor.jpeg"
import * as THREE from 'three';


interface Shape {
  width: Int32List;
  height: Int32List;
}

function CoffeeShop (props: any )  {
  var loader = new THREE.Texture();
  const colorMap = useLoader( THREE.TextureLoader, texture);
  
  return (
    <mesh rotation={[90, 0, 20]}>
      <boxGeometry attach="geometry" args={[3, 3, 3]} />
      <meshNormalMaterial attach="material" />
      <meshStandardMaterial map={colorMap} /> 
    </mesh>


  );
}

export default CoffeeShop;