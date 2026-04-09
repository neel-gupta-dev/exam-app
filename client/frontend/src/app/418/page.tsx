"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TeapotGeometry } from "three/examples/jsm/geometries/TeapotGeometry.js";
import { motion } from "framer-motion";

export default function TeapotPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(20, 15, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xc0c1ff, 2, 100);
    pointLight.position.set(10, 20, 10);
    scene.add(pointLight);

    const secondaryLight = new THREE.PointLight(0x7c7db5, 1, 100);
    secondaryLight.position.set(-10, -10, -10);
    scene.add(secondaryLight);

    // --- Teapot ---
    const teapotMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xc0c1ff,
      metalness: 0.9,
      roughness: 0.1,
      reflectivity: 1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const teapotGeometry = new TeapotGeometry(5);
    const teapot = new THREE.Mesh(teapotGeometry, teapotMaterial);
    scene.add(teapot);

    // --- Tea Pouring Particles ---
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Start hidden/centered
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = -Math.random() * 0.1 - 0.05;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x6f4e37, // Coffee/Tea color
      size: 0.15,
      transparent: true,
      opacity: 0.8,
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2;

    // --- Animation Loop ---
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Rotate teapot and tilt it every now and then for "pouring"
      const tilt = Math.max(0, Math.sin(time) * 0.8);
      teapot.rotation.z = tilt;
      
      // Update particles for pouring effect
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      
      // Spout position (roughly)
      const spoutX = -5 - Math.sin(tilt) * 2;
      const spoutY = 2 - tilt * 3;
      const spoutZ = 0;

      for (let i = 0; i < particleCount; i++) {
        if (tilt > 0.4) {
          // Pouring!
          positions[i * 3] += velocities[i * 3];
          positions[i * 3 + 1] += velocities[i * 3 + 1];
          positions[i * 3 + 2] += velocities[i * 3 + 2];

          // Reset particle if it goes too low
          if (positions[i * 3 + 1] < -10) {
            positions[i * 3] = spoutX;
            positions[i * 3 + 1] = spoutY;
            positions[i * 3 + 2] = spoutZ;
          }
        } else {
          // Not pouring - hide particles
          positions[i * 3 + 1] = -100;
        }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050507] overflow-hidden flex items-center justify-center p-0 m-0">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[150px] rounded-full" />
      </div>

      {/* Three.js Container */}
      <div ref={containerRef} className="w-full h-full absolute inset-0 z-0" />

      {/* UI Overlay */}
      <div className="relative z-10 w-full max-w-4xl px-8 pointer-events-none select-none">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="text-left"
        >
          <h1 className="text-[12rem] font-black leading-none tracking-tighter text-white opacity-5 mb-0">
            418
          </h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 mt-[-4rem] ml-12 inline-block shadow-2xl"
          >
            <h2 className="text-3xl font-black text-white/90 mb-1 leading-tight">
              I'M A TEAPOT
            </h2>
            <p className="text-primary font-mono text-sm uppercase tracking-widest font-bold">
              Hyper Text Coffee Pot Control Protocol
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-12 ml-16"
        >
          <div className="flex items-center gap-4 text-white/40 text-xs font-medium tracking-widest uppercase">
            <span className="w-12 h-px bg-white/20"></span>
            <span>Error status 418</span>
            <span className="w-24 h-px bg-white/20"></span>
          </div>
          <p className="mt-4 max-w-sm text-white/30 text-sm italic">
            "The HTCPCP server is a teapot; the resulting entity body may be short and stout."
          </p>
        </motion.div>
      </div>

      {/* Interactive Hint */}
      <motion.div 
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 text-white/20 text-[10px] uppercase tracking-[0.5em] font-bold"
      >
        Click & Drag to Rotate
      </motion.div>

      <style jsx global>{`
        :root {
          --primary: #c0c1ff;
        }
      `}</style>
    </div>
  );
}
