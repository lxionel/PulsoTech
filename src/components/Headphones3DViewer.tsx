"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RotateCw, Sparkles, Layers } from "lucide-react";

interface ColorOption {
  name: string;
  hex: string;
  colorThree: number;
  textColor: string;
}

const COLOR_OPTIONS: ColorOption[] = [
  { name: "Negro Mate", hex: "#18181b", colorThree: 0x18181b, textColor: "text-neutral-900" },
  { name: "Plata Titanio", hex: "#d4d4d8", colorThree: 0xd4d4d8, textColor: "text-neutral-600" },
  { name: "Gris Grafito", hex: "#3f3f46", colorThree: 0x3f3f46, textColor: "text-neutral-700" },
];

export default function Headphones3DViewer({
  onColorChange,
}: {
  onColorChange?: (colorName: string) => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState<ColorOption>(COLOR_OPTIONS[0]);
  const [isRotatingManually, setIsRotatingManually] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const materialsRef = useRef<{
    body: THREE.MeshStandardMaterial[];
    cushion: THREE.MeshStandardMaterial[];
    metal: THREE.MeshStandardMaterial[];
  }>({
    body: [],
    cushion: [],
    metal: [],
  });

  const sceneGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 450;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf0f4f8, 1.2);
    fillLight.position.set(-4, 2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.6);
    rimLight.position.set(0, -3, 3);
    scene.add(rimLight);

    // 3. Build Realistic Geometric Headphone 3D Model
    const headphoneGroup = new THREE.Group();
    scene.add(headphoneGroup);
    sceneGroupRef.current = headphoneGroup;

    materialsRef.current = { body: [], cushion: [], metal: [] };

    // Material definitions
    const bodyMat = new THREE.MeshStandardMaterial({
      color: selectedColor.colorThree,
      roughness: 0.35,
      metalness: 0.25,
    });
    materialsRef.current.body.push(bodyMat);

    const cushionMat = new THREE.MeshStandardMaterial({
      color: 0x1f1f23,
      roughness: 0.85,
      metalness: 0.05,
    });
    materialsRef.current.cushion.push(cushionMat);

    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xe4e4e7,
      roughness: 0.2,
      metalness: 0.9,
    });
    materialsRef.current.metal.push(metalMat);

    // Headband curve (Torus arc)
    const headbandGeo = new THREE.TorusGeometry(1.4, 0.09, 24, 60, Math.PI);
    const headband = new THREE.Mesh(headbandGeo, bodyMat);
    headband.rotation.z = -Math.PI;
    headband.position.y = 0.2;
    headphoneGroup.add(headband);

    // Headband cushion pad
    const padGeo = new THREE.TorusGeometry(1.36, 0.07, 16, 40, Math.PI * 0.7);
    const pad = new THREE.Mesh(padGeo, cushionMat);
    pad.rotation.z = -Math.PI * 0.85;
    pad.position.y = 0.17;
    headphoneGroup.add(pad);

    // Function to build an earcup assembly
    const createEarcup = (side: "left" | "right") => {
      const earcupGroup = new THREE.Group();
      const xPos = side === "left" ? -1.42 : 1.42;

      // Metal slider arm
      const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 16);
      const arm = new THREE.Mesh(armGeo, metalMat);
      arm.position.set(xPos, 0.1, 0);
      headphoneGroup.add(arm);

      // Outer cup housing (Capsule / Cylinder with bevel)
      const cupGeo = new THREE.CylinderGeometry(0.68, 0.72, 0.32, 32);
      const cup = new THREE.Mesh(cupGeo, bodyMat);
      cup.rotation.z = side === "left" ? Math.PI / 2 : -Math.PI / 2;
      earcupGroup.add(cup);

      // Metallic trim ring
      const ringGeo = new THREE.TorusGeometry(0.71, 0.025, 16, 32);
      const ring = new THREE.Mesh(ringGeo, metalMat);
      ring.rotation.y = Math.PI / 2;
      earcupGroup.add(ring);

      // Memory foam ear cushion
      const cushionGeo = new THREE.TorusGeometry(0.66, 0.16, 20, 32);
      const cushion = new THREE.Mesh(cushionGeo, cushionMat);
      cushion.rotation.y = Math.PI / 2;
      cushion.position.x = side === "left" ? 0.2 : -0.2;
      earcupGroup.add(cushion);

      // Center laser engraved plate
      const plateGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.02, 32);
      const plate = new THREE.Mesh(plateGeo, metalMat);
      plate.rotation.z = side === "left" ? Math.PI / 2 : -Math.PI / 2;
      plate.position.x = side === "left" ? -0.16 : 0.16;
      earcupGroup.add(plate);

      earcupGroup.position.set(xPos, -0.25, 0);
      headphoneGroup.add(earcupGroup);
    };

    createEarcup("left");
    createEarcup("right");

    // Tilt the headphone slightly for a dramatic studio look
    headphoneGroup.rotation.x = 0.15;
    headphoneGroup.rotation.y = -0.4;

    // 4. Mouse / Drag Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      setIsRotatingManually(true);
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      previousMousePosition = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !sceneGroupRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;

      sceneGroupRef.current.rotation.y += deltaX * 0.012;
      sceneGroupRef.current.rotation.x += deltaY * 0.008;

      previousMousePosition = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);

    domElement.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);

    // 5. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle floating animation
      if (sceneGroupRef.current) {
        sceneGroupRef.current.position.y = Math.sin(elapsedTime * 1.5) * 0.08;

        // Auto slow rotation if not manually dragged
        if (!isDragging) {
          sceneGroupRef.current.rotation.y += 0.004;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 6. Resize handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      domElement.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      domElement.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update color dynamically in Three.js
  const handleSelectColor = (color: ColorOption) => {
    setSelectedColor(color);
    materialsRef.current.body.forEach((mat) => {
      mat.color.setHex(color.colorThree);
      if (color.name === "Plata Titanio") {
        mat.metalness = 0.7;
        mat.roughness = 0.25;
      } else {
        mat.metalness = 0.25;
        mat.roughness = 0.35;
      }
    });
    if (onColorChange) {
      onColorChange(color.name);
    }
  };

  const resetRotation = () => {
    if (sceneGroupRef.current) {
      sceneGroupRef.current.rotation.x = 0.15;
      sceneGroupRef.current.rotation.y = -0.4;
      setIsRotatingManually(false);
    }
  };

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] rounded-3xl bg-gradient-to-b from-[#f5f5f7] to-[#e8e8ed] border border-neutral-200/90 shadow-sm flex flex-col justify-between p-4 sm:p-6 overflow-hidden select-none">
      {/* Top 3D Badge */}
      <div className="flex items-center justify-between z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200 text-xs font-semibold text-neutral-800 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px] tracking-tight">MODELO 3D INTERACTIVO</span>
        </div>

        <button
          onClick={resetRotation}
          className="p-2 rounded-full bg-white/90 hover:bg-white text-neutral-600 hover:text-black border border-neutral-200 shadow-xs transition-colors"
          title="Centrar rotación"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing flex items-center justify-center"
      />

      {/* Interactive Feature Tags on 3D */}
      <div className="absolute top-1/3 left-4 z-10">
        <button
          onClick={() => setActiveHotspot(activeHotspot === "anc" ? null : "anc")}
          className="group relative px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-neutral-200 text-[10px] font-mono font-bold text-neutral-800 shadow-xs hover:border-black transition-all flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-black" />
          <span>ANC 45dB</span>
          {activeHotspot === "anc" && (
            <div className="absolute left-0 bottom-full mb-1.5 w-44 p-2.5 rounded-xl bg-black text-white text-[10px] font-sans leading-tight shadow-lg z-20">
              6 micrófonos con algoritmo adaptativo que anula el 98% del ruido.
            </div>
          )}
        </button>
      </div>

      <div className="absolute bottom-1/3 right-4 z-10">
        <button
          onClick={() => setActiveHotspot(activeHotspot === "driver" ? null : "driver")}
          className="group relative px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-neutral-200 text-[10px] font-mono font-bold text-neutral-800 shadow-xs hover:border-black transition-all flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-black" />
          <span>Drivers 40mm Titanio</span>
          {activeHotspot === "driver" && (
            <div className="absolute right-0 bottom-full mb-1.5 w-44 p-2.5 rounded-xl bg-black text-white text-[10px] font-sans leading-tight shadow-lg z-20">
              Diafragma aeroespacial de titanio para graves profundos y agudos nítidos.
            </div>
          )}
        </button>
      </div>

      {/* Bottom Controls: Color Swatches & Drag Hint */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 z-10 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-neutral-200/80 shadow-xs">
        {/* Colors in 3D */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-700">Acabado 3D:</span>
          <div className="flex items-center gap-1.5">
            {COLOR_OPTIONS.map((col) => (
              <button
                key={col.name}
                onClick={() => handleSelectColor(col)}
                title={col.name}
                aria-label={col.name}
                className={`w-6 h-6 rounded-full border transition-transform flex items-center justify-center ${
                  selectedColor.name === col.name
                    ? "border-black scale-110 ring-2 ring-black/20"
                    : "border-neutral-300 opacity-75 hover:opacity-100"
                }`}
                style={{ backgroundColor: col.hex }}
              />
            ))}
          </div>
          <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline ml-1">
            {selectedColor.name}
          </span>
        </div>

        {/* Drag Hint */}
        <div className="text-[11px] text-neutral-500 font-medium flex items-center gap-1.5">
          <span>Arrastra para rotar 360°</span>
        </div>
      </div>
    </div>
  );
}
