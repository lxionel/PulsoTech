"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Rotate3D, Sparkles } from "lucide-react";

export default function Headphone3DModel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.2, 5.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // --- Lighting Setup ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Key Light (top-front-left)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(-3, 4, 4);
    scene.add(keyLight);

    // Cyan Tech Rim Light (back-right)
    const rimLightBlue = new THREE.DirectionalLight(0x38bdf8, 3.8);
    rimLightBlue.position.set(4, 3, -3);
    scene.add(rimLightBlue);

    // Soft White Fill Light (bottom-left)
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 1.4);
    fillLight.position.set(-3, -2, 2);
    scene.add(fillLight);

    // Center subtle point glow
    const pointGlow = new THREE.PointLight(0x60a5fa, 1.2, 10);
    pointGlow.position.set(0, 0, 1.5);
    scene.add(pointGlow);

    // --- 3D Headphone Model Construction ---
    const headphoneGroup = new THREE.Group();

    // Materials
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x22252a,
      metalness: 0.92,
      roughness: 0.2,
    });

    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xd8e0e8,
      metalness: 0.98,
      roughness: 0.12,
    });

    const cushionMaterial = new THREE.MeshStandardMaterial({
      color: 0x141619,
      roughness: 0.85,
      metalness: 0.1,
    });

    const headbandCushionMaterial = new THREE.MeshStandardMaterial({
      color: 0x181a1f,
      roughness: 0.7,
      metalness: 0.15,
    });

    const ledGlowMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.8,
      roughness: 0.3,
      metalness: 0.2,
    });

    const grillMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0b0d,
      roughness: 0.95,
      metalness: 0.05,
    });

    // 1. Headband Arch (Curved Tube)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.45, 0.1, 0),
      new THREE.Vector3(-1.3, 1.25, 0),
      new THREE.Vector3(-0.7, 1.75, 0),
      new THREE.Vector3(0, 1.85, 0),
      new THREE.Vector3(0.7, 1.75, 0),
      new THREE.Vector3(1.3, 1.25, 0),
      new THREE.Vector3(1.45, 0.1, 0),
    ]);
    const headbandGeo = new THREE.TubeGeometry(curve, 64, 0.11, 24, false);
    const headbandMesh = new THREE.Mesh(headbandGeo, headbandCushionMaterial);
    headphoneGroup.add(headbandMesh);

    // Steel outer accent spine for headband
    const spineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.47, 0.1, 0),
      new THREE.Vector3(-1.32, 1.3, 0),
      new THREE.Vector3(-0.7, 1.82, 0),
      new THREE.Vector3(0, 1.92, 0),
      new THREE.Vector3(0.7, 1.82, 0),
      new THREE.Vector3(1.32, 1.3, 0),
      new THREE.Vector3(1.47, 0.1, 0),
    ]);
    const spineGeo = new THREE.TubeGeometry(spineCurve, 64, 0.035, 16, false);
    const spineMesh = new THREE.Mesh(spineGeo, chromeMaterial);
    headphoneGroup.add(spineMesh);

    // 2. Ear Cup Builder Helper
    const createEarCup = (isLeft: boolean) => {
      const cupGroup = new THREE.Group();
      const sideMultiplier = isLeft ? -1 : 1;

      // Vertical Slider Arm
      const armGeo = new THREE.BoxGeometry(0.06, 0.45, 0.08);
      const armMesh = new THREE.Mesh(armGeo, chromeMaterial);
      armMesh.position.set(0, 0.15, 0);
      cupGroup.add(armMesh);

      // Pivot Hinge Cylinder
      const hingeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 24);
      hingeGeo.rotateZ(Math.PI / 2);
      const hingeMesh = new THREE.Mesh(hingeGeo, metalMaterial);
      hingeMesh.position.set(0, -0.05, 0);
      cupGroup.add(hingeMesh);

      // Yoke Bracket (curved U shape holding the ear cup)
      const yokeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.45 * sideMultiplier, -0.4, 0),
        new THREE.Vector3(-0.4 * sideMultiplier, -0.15, 0),
        new THREE.Vector3(0, -0.05, 0),
        new THREE.Vector3(0.4 * sideMultiplier, -0.15, 0),
        new THREE.Vector3(0.45 * sideMultiplier, -0.4, 0),
      ]);
      const yokeGeo = new THREE.TubeGeometry(yokeCurve, 32, 0.045, 16, false);
      const yokeMesh = new THREE.Mesh(yokeGeo, metalMaterial);
      cupGroup.add(yokeMesh);

      // Outer Ear Cup Body (Chassis)
      const cupGeo = new THREE.CylinderGeometry(0.68, 0.64, 0.36, 48);
      cupGeo.rotateZ(Math.PI / 2);
      const cupMesh = new THREE.Mesh(cupGeo, metalMaterial);
      cupMesh.position.set(0.12 * sideMultiplier, -0.4, 0);
      cupMesh.scale.set(1, 1.25, 1);
      cupGroup.add(cupMesh);

      // Outer Bevel Accent Ring
      const ringGeo = new THREE.TorusGeometry(0.67, 0.025, 24, 48);
      ringGeo.rotateY(Math.PI / 2);
      const ringMesh = new THREE.Mesh(ringGeo, chromeMaterial);
      ringMesh.position.set(0.28 * sideMultiplier, -0.4, 0);
      ringMesh.scale.set(1, 1.25, 1);
      cupGroup.add(ringMesh);

      // Outer Center Plate (Brushed Aluminum Core)
      const centerPlateGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 48);
      centerPlateGeo.rotateZ(Math.PI / 2);
      const centerPlateMesh = new THREE.Mesh(centerPlateGeo, chromeMaterial);
      centerPlateMesh.position.set(0.3 * sideMultiplier, -0.4, 0);
      centerPlateMesh.scale.set(1, 1.22, 1);
      cupGroup.add(centerPlateMesh);

      // LED Ambient Status Ring
      const ledGeo = new THREE.TorusGeometry(0.51, 0.015, 16, 48);
      ledGeo.rotateY(Math.PI / 2);
      const ledMesh = new THREE.Mesh(ledGeo, ledGlowMaterial);
      ledMesh.position.set(0.31 * sideMultiplier, -0.4, 0);
      ledMesh.scale.set(1, 1.22, 1);
      cupGroup.add(ledMesh);

      // Inner Ear Cushion (Soft Memory Foam)
      const cushionGeo = new THREE.TorusGeometry(0.55, 0.16, 24, 48);
      cushionGeo.rotateY(Math.PI / 2);
      const cushionMesh = new THREE.Mesh(cushionGeo, cushionMaterial);
      cushionMesh.position.set(-0.12 * sideMultiplier, -0.4, 0);
      cushionMesh.scale.set(1, 1.25, 1);
      cupGroup.add(cushionMesh);

      // Inner Speaker Driver Grill
      const grillGeo = new THREE.CircleGeometry(0.48, 36);
      grillGeo.rotateY(isLeft ? Math.PI / 2 : -Math.PI / 2);
      const grillMesh = new THREE.Mesh(grillGeo, grillMaterial);
      grillMesh.position.set(-0.15 * sideMultiplier, -0.4, 0);
      grillMesh.scale.set(1, 1.22, 1);
      cupGroup.add(grillMesh);

      return cupGroup;
    };

    const leftCup = createEarCup(true);
    leftCup.position.set(-1.42, 0.1, 0);
    headphoneGroup.add(leftCup);

    const rightCup = createEarCup(false);
    rightCup.position.set(1.42, 0.1, 0);
    headphoneGroup.add(rightCup);

    // Initial scale and centering
    headphoneGroup.scale.set(0.92, 0.92, 0.92);
    headphoneGroup.position.set(0, -0.1, 0);
    scene.add(headphoneGroup);

    // Floor Soft Shadow
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const shadowCtx = shadowCanvas.getContext("2d");
    if (shadowCtx) {
      const gradient = shadowCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, "rgba(0, 0, 0, 0.55)");
      gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.2)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      shadowCtx.fillStyle = gradient;
      shadowCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 2.4),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, -1.8, 0);
    scene.add(shadowPlane);

    setIsLoaded(true);

    // --- Interactive Mouse & Drag & Scroll Logic ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0.15;
    let targetRotY = 0.45;
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let scrollRotationOffset = 0;

    // Track scroll
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      // 1 full turn per 800px of scroll
      scrollRotationOffset = (scrollY / 450) * Math.PI;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // Mouse movement inside container
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x * 0.4;
      mouseY = y * 0.3;

      if (isDragging) {
        const deltaX = e.clientX - prevPointerX;
        const deltaY = e.clientY - prevPointerY;
        targetRotY += deltaX * 0.012;
        targetRotX += deltaY * 0.012;
        prevPointerX = e.clientX;
        prevPointerY = e.clientY;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      setIsInteracting(true);
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      container.setPointerCapture(e.pointerId);
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDragging = false;
      setIsInteracting(false);
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {}
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointercancel", handlePointerUp);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // --- Animation Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle floating hover
      const floatY = Math.sin(elapsedTime * 1.6) * 0.08;
      headphoneGroup.position.y = -0.1 + floatY;

      // Auto rotation when not dragging
      if (!isDragging) {
        targetRotY += 0.003;
      }

      // Smooth interpolation (Lerp)
      const currentScrollY = scrollRotationOffset;
      const combinedTargetY = targetRotY + currentScrollY + mouseX;
      const combinedTargetX = targetRotX - mouseY * 0.5 + Math.sin(currentScrollY * 0.5) * 0.15;

      headphoneGroup.rotation.y += (combinedTargetY - headphoneGroup.rotation.y) * 0.06;
      headphoneGroup.rotation.x += (combinedTargetX - headphoneGroup.rotation.x) * 0.06;

      // Floating shadow scale
      const shadowScale = 1 - floatY * 0.5;
      shadowPlane.scale.set(shadowScale, shadowScale, shadowScale);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointercancel", handlePointerUp);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] lg:h-[480px] flex items-center justify-center select-none touch-none">
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
      />

      {/* Floating 3D Badge Indicator */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white text-[10px] sm:text-xs font-bold tracking-wide shadow-lg">
        <Rotate3D className={`w-3.5 h-3.5 text-sky-400 ${isInteracting ? "animate-spin" : ""}`} />
        <span>Modelo 3D Interactivo • Rota al hacer scroll</span>
        <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
      </div>

      {/* Loading state skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-sky-400/20 border-t-sky-400 animate-spin" />
        </div>
      )}
    </div>
  );
}
