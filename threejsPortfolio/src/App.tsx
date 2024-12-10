import { OrbitControls, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { MutableRefObject, useRef } from "react";
import { Mesh } from "three";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <main className="max-w-7xl mx-auto relative">
      <Navbar />
    </main>
  );
};

export default App;
