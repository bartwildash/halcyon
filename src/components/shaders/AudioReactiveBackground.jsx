import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAudioAnalysis } from '../../hooks/useAudioAnalysis';

// ==========================================
// SHADER DEFINITIONS
// ==========================================

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Simplex Noise (2D) Helper
const simplexNoise = `
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

const noiseFlowFragment = `
uniform float uTime;
uniform float uBass;
uniform float uMid;
uniform float uTreble;
uniform float uBeat;
uniform float uIntensity;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

varying vec2 vUv;

${simplexNoise}

void main() {
  vec2 uv = vUv;
  
  // Bass drives large-scale movement
  float slowNoise = snoise(uv * 2.0 + uTime * 0.1 + uBass * 0.5);
  
  // Mid drives medium detail
  float medNoise = snoise(uv * 5.0 + uTime * 0.3) * uMid;
  
  // Treble drives fine detail / sparkle
  float fineNoise = snoise(uv * 20.0 + uTime * 0.8) * uTreble * 0.3;
  
  float noise = slowNoise + medNoise + fineNoise;
  
  // Beat flash
  noise += uBeat * 0.4;
  
  // Color mapping
  vec3 color = mix(uColor1, uColor2, noise * 0.5 + 0.5);
  color = mix(color, uColor3, fineNoise + uBeat * 0.5);
  
  // Intensity control
  color *= 0.3 + uIntensity * 0.7;
  
  gl_FragColor = vec4(color, 1.0);
}
`;

const voidFragment = `
uniform vec3 uColor1;
void main() {
  gl_FragColor = vec4(uColor1, 1.0);
}
`;

// Map shader types to fragment code
const getFragmentShader = (type) => {
  switch (type) {
    case 'void': return voidFragment;
    case 'noise-flow': 
    default: return noiseFlowFragment;
  }
};

// ==========================================
// COMPONENT
// ==========================================

export const AudioReactiveBackground = ({
  shaderType = 'noise-flow',
  audioSource = 'none',
  audioRef = null, // Ref to HTMLAudioElement
  intensity = 0.5,
  colorScheme = ['#1a1a2e', '#16213e', '#0f3460'],
  beatResponse = 'pulse'
}) => {
  const meshRef = useRef();
  
  // Use the hook to get analysis data
  const audio = useAudioAnalysis(audioSource, audioRef);
  
  // Uniforms ref to avoid recreation
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uTreble: { value: 0 },
    uBeat: { value: 0 },
    uIntensity: { value: intensity },
    uColor1: { value: new THREE.Color(colorScheme[0]) },
    uColor2: { value: new THREE.Color(colorScheme[1]) },
    uColor3: { value: new THREE.Color(colorScheme[2]) },
  }), []); // Re-create if colors change? Ideally update value.

  // Update uniform values on prop change
  useEffect(() => {
    uniforms.uIntensity.value = intensity;
    uniforms.uColor1.value.set(colorScheme[0]);
    uniforms.uColor2.value.set(colorScheme[1]);
    uniforms.uColor3.value.set(colorScheme[2]);
  }, [intensity, colorScheme, uniforms]);

  // Frame Loop
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    // Smooth the audio values manually or assume hook is fast enough
    // For R3F, we want to update every frame.
    // The useAudioAnalysis hook updates state via RAF, which triggers re-render of this component? 
    // Actually, useAudioAnalysis sets state, causing re-render. 
    // This is fine for React logic, but for shaders we might want refs for performance.
    // However, the hook returns values. 
    
    // Optimization: The hook causes re-renders. 
    // For now, we update uniforms in the re-render cycle or useFrame.
    // Since 'audio' changes every frame (from the hook), this component re-renders every frame.
    // We can just set uniforms here.
    
    uniforms.uTime.value = clock.elapsedTime;
    
    // Use the values from the hook state
    uniforms.uBass.value = THREE.MathUtils.lerp(uniforms.uBass.value, audio.bass, 0.1);
    uniforms.uMid.value = THREE.MathUtils.lerp(uniforms.uMid.value, audio.mid, 0.1);
    uniforms.uTreble.value = THREE.MathUtils.lerp(uniforms.uTreble.value, audio.treble, 0.1);
    
    // Beat flash logic
    const targetBeat = audio.beat ? 1.0 : 0.0;
    uniforms.uBeat.value = THREE.MathUtils.lerp(uniforms.uBeat.value, targetBeat, 0.15);
  });

  return (
    <mesh ref={meshRef} scale={[1, 1, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={getFragmentShader(shaderType)}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
};
