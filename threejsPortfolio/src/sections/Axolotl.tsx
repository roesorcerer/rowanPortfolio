import * as THREE from 'three'
import React, { useRef, useMemo, useContext, createContext, ReactNode } from 'react'
import { useGLTF, Merged } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { Object3DProps } from '@react-three/fiber'
import axolotl from '../public/models/cute_axolotl.glb';

type GLTFResult = GLTF & {
  nodes: {
    pCube1_standardSurface1_0: THREE.Mesh
    pCube3_standardSurface1_0: THREE.Mesh
    pCube5_standardSurface1_0: THREE.Mesh
    pCube6_standardSurface1_0: THREE.Mesh
    pCube11_standardSurface1_0: THREE.Mesh
    polySurface1_standardSurface1_0: THREE.Mesh
    pTorus1_standardSurface1_0: THREE.Mesh
    pCube12_standardSurface1_0: THREE.Mesh
    pCube13_standardSurface1_0: THREE.Mesh
    pCube14_standardSurface1_0: THREE.Mesh
    pCube15_standardSurface1_0: THREE.Mesh
    pCube16_standardSurface1_0: THREE.Mesh
    pCube17_standardSurface1_0: THREE.Mesh
    pCube18_standardSurface1_0: THREE.Mesh
    pCube19_standardSurface1_0: THREE.Mesh
    pCube20_standardSurface1_0: THREE.Mesh
    pCube21_standardSurface1_0: THREE.Mesh
    pCube22_standardSurface1_0: THREE.Mesh
    pCube24_standardSurface1_0: THREE.Mesh
    pCube25_standardSurface1_0: THREE.Mesh
    pCube26_standardSurface1_0: THREE.Mesh
    pCube27_standardSurface1_0: THREE.Mesh
    pCube76_standardSurface1_0: THREE.Mesh
    pCube77_standardSurface1_0: THREE.Mesh
    pCube78_standardSurface1_0: THREE.Mesh
    pCube79_standardSurface1_0: THREE.Mesh
    pCube80_standardSurface1_0: THREE.Mesh
  }
  materials: {
    standardSurface1: THREE.MeshStandardMaterial
  }
}

// Type for the merged instances
type MergedType = {
  [key: string]: React.ForwardRefExoticComponent<Object3DProps & { children?: ReactNode }>
}

const Context = createContext<MergedType | null>(null)

interface InstancesProps {
  children: ReactNode
  [key: string]: any
}

export function Instances({ children, ...props }: InstancesProps) {
  const { nodes } = useGLTF(axolotl) as GLTFResult

  const instances = useMemo(
    () => ({
      PCubestandardSurface: nodes.pCube1_standardSurface1_0,
      PCubestandardSurface1: nodes.pCube3_standardSurface1_0,
      PCubestandardSurface2: nodes.pCube5_standardSurface1_0,
      PCubestandardSurface3: nodes.pCube6_standardSurface1_0,
      PCubestandardSurface4: nodes.pCube11_standardSurface1_0,
      PolySurfacestandardSurface: nodes.polySurface1_standardSurface1_0,
      PTorusstandardSurface: nodes.pTorus1_standardSurface1_0,
      PCubestandardSurface5: nodes.pCube12_standardSurface1_0,
      PCubestandardSurface6: nodes.pCube13_standardSurface1_0,
      PCubestandardSurface7: nodes.pCube14_standardSurface1_0,
      PCubestandardSurface8: nodes.pCube15_standardSurface1_0,
      PCubestandardSurface9: nodes.pCube16_standardSurface1_0,
      PCubestandardSurface10: nodes.pCube17_standardSurface1_0,
      PCubestandardSurface11: nodes.pCube18_standardSurface1_0,
      PCubestandardSurface12: nodes.pCube19_standardSurface1_0,
      PCubestandardSurface13: nodes.pCube20_standardSurface1_0,
      PCubestandardSurface14: nodes.pCube21_standardSurface1_0,
      PCubestandardSurface15: nodes.pCube22_standardSurface1_0,
      PCubestandardSurface16: nodes.pCube24_standardSurface1_0,
      PCubestandardSurface17: nodes.pCube25_standardSurface1_0,
      PCubestandardSurface18: nodes.pCube26_standardSurface1_0,
      PCubestandardSurface19: nodes.pCube27_standardSurface1_0,
      PCubestandardSurface20: nodes.pCube76_standardSurface1_0,
      PCubestandardSurface21: nodes.pCube77_standardSurface1_0,
      PCubestandardSurface22: nodes.pCube78_standardSurface1_0,
      PCubestandardSurface23: nodes.pCube79_standardSurface1_0,
      PCubestandardSurface24: nodes.pCube80_standardSurface1_0,
    }),
    [nodes]
  )

  return (
    <Merged meshes={instances} {...props}>
      {(instances: MergedType) => (
        <Context.Provider value={instances}>
          {children}
        </Context.Provider>
      )}
    </Merged>
  )
}

interface ModelProps extends Omit<JSX.IntrinsicElements['group'], 'scale'> {
  scale?: number | [number, number, number]
}

export function Model(props: ModelProps) {
  const instances = useContext(Context)

  if (!instances) {
    console.error('Model must be used within Instances component')
    return null
  }

  const {
    PCubestandardSurface,
    PCubestandardSurface1,
    PCubestandardSurface2,
    PCubestandardSurface3,
    PCubestandardSurface4,
    PolySurfacestandardSurface,
    PTorusstandardSurface,
    PCubestandardSurface5,
    PCubestandardSurface6,
    PCubestandardSurface7,
    PCubestandardSurface8,
    PCubestandardSurface9,
    PCubestandardSurface10,
    PCubestandardSurface11,
    PCubestandardSurface12,
    PCubestandardSurface13,
    PCubestandardSurface14,
    PCubestandardSurface15,
    PCubestandardSurface16,
    PCubestandardSurface17,
    PCubestandardSurface18,
    PCubestandardSurface19,
    PCubestandardSurface20,
    PCubestandardSurface21,
    PCubestandardSurface22,
    PCubestandardSurface23,
    PCubestandardSurface24,
  } = instances

  return (
    <group {...props} dispose={null}>
      <group name="930fe1e51cef452088e7de27000f77eafbx" scale={0.01}>
        <PCubestandardSurface
          position={[0, 3.032, 3.165]}
          scale={[3.888, 3.024, 3.01]}
        />
        <PCubestandardSurface1
          position={[2.198, 3.57, 2.747]}
          rotation={[1.638, 0.381, -0.249]}
          scale={[1.698, 0.346, 0.346]}
        />
        <PCubestandardSurface2
          position={[2.225, 2.621, 2.77]}
          rotation={[1.471, -0.345, -0.205]}
          scale={[1.501, 0.306, 0.306]}
        />
        <PCubestandardSurface3
          position={[1.901, 2.002, 2.705]}
          rotation={[1.177, -0.615, -0.485]}
          scale={[1.335, 0.272, 0.272]}
        />
        <PCubestandardSurface4
          position={[0.829, 1.491, 4.024]}
          rotation={[0, -0.189, 0]}
          scale={0.617}
        />
        <PolySurfacestandardSurface
          position={[-4.08, 0, 0]}
        />
        <PTorusstandardSurface
          position={[0, 1.723, 4.976]}
          scale={0.735}
        />
        <PCubestandardSurface5
          position={[-0.71, 1.846, 4.172]}
          rotation={[-0.441, 0.342, -2.4]}
          scale={0.617}
        />
        <PCubestandardSurface6
          position={[-0.545, 2.297, 4.579]}
          rotation={[1.254, 0.443, 0.236]}
          scale={0.253}
        />
        <PCubestandardSurface7
          position={[1.695, 3.031, 3.417]}
          rotation={[0, 0, Math.PI / 2]}
          scale={0.472}
        />
        <PCubestandardSurface8
          position={[0, -1.249, 0]}
        />
        <PCubestandardSurface9
          position={[0, 0.924, 4.976]}
          rotation={[Math.PI, 0, 0]}
          scale={1.156}
        />
        <PCubestandardSurface10
          position={[0, 2.067, 4.614]}
        />
        <PCubestandardSurface11
          position={[3.167, -1.701, 1.339]}
          rotation={[-0.145, -0.748, -0.211]}
        />
        <PCubestandardSurface12
          position={[1.166, 0.503, -0.297]}
          rotation={[0.331, -0.22, 0.035]}
        />
        <PCubestandardSurface13
          position={[2.318, -2.008, 10.121]}
          rotation={[3.058, -0.644, -2.82]}
        />
        <PCubestandardSurface14
          position={[2.219, -1.928, 0.601]}
          rotation={[-0.156, -0.433, 0]}
        />
        <PCubestandardSurface15
          position={[0, 0.787, 2.156]}
          rotation={[0.145, 0, 0]}
        />
        <PCubestandardSurface16
          position={[1.889, 3.031, 3.417]}
          rotation={[0, 0, Math.PI / 2]}
          scale={0.354}
        />
        <PCubestandardSurface17
          position={[-1.155, 4.691, 3.417]}
          scale={0.354}
        />
        <PCubestandardSurface18
          position={[0, 0.553, 6.879]}
          scale={[2.513, 0.229, 2.026]}
        />
        <PCubestandardSurface19
          position={[-0.014, 1.034, 7.111]}
          rotation={[0.318, -Math.PI / 2, 0]}
          scale={[1.492, 0.281, 2.248]}
        />
        <PCubestandardSurface20
          position={[-1.288, 0.675, 7.417]}
          scale={0.142}
        />
        <PCubestandardSurface21
          position={[-0.559, 0.208, -5.355]}
          scale={[4.814, 0.621, 1.833]}
        />
        <PCubestandardSurface22
          position={[0.038, 0.208, 0.11]}
          scale={[1.452, 0.621, 0.944]}
        />
        <PCubestandardSurface23
          position={[-0.35, 0.208, 0.11]}
          scale={[1.452, 0.621, 0.944]}
        />
        <PCubestandardSurface24
          position={[-1.531, 0.623, 7.637]}
          scale={0.142}
        />
      </group>
    </group>
  )
}

export default function AxolotlScene(props: ModelProps) {
  return (
    <Instances>
      <Model {...props} />
    </Instances>
  )
}

useGLTF.preload(axolotl)