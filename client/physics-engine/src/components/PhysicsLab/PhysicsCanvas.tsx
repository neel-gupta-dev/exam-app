"use client";

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

interface PhysicsCanvasProps {
  gravity?: number;
  timeScale?: number;
  showVectors?: boolean;
  onStatsUpdate?: (stats: any) => void;
  preset?: string;
}

const PhysicsCanvas: React.FC<PhysicsCanvasProps> = ({ 
  gravity = 1, 
  timeScale = 1,
  showVectors = true,
  onStatsUpdate,
  preset
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    // 1. Initialize Engine & World
    const engine = Matter.Engine.create();
    const world = engine.world;
    engineRef.current = engine;

    // 2. Initialize Renderer
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: sceneRef.current.clientWidth,
        height: sceneRef.current.clientHeight,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio,
      }
    });
    renderRef.current = render;

    // 3. Create Walls (Static Bodies)
    const width = sceneRef.current.clientWidth;
    const height = sceneRef.current.clientHeight;
    const wallOptions = { isStatic: true, render: { visible: false } };

    const ground = Matter.Bodies.rectangle(width / 2, height + 30, width, 60, wallOptions);
    const ceiling = Matter.Bodies.rectangle(width / 2, -30, width, 60, wallOptions);
    const leftWall = Matter.Bodies.rectangle(-30, height / 2, 60, height, wallOptions);
    const rightWall = Matter.Bodies.rectangle(width + 30, height / 2, 60, height, wallOptions);

    Matter.Composite.add(world, [ground, ceiling, leftWall, rightWall]);

    // 4. Add Mouse Control
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });

    Matter.Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    // 5. Initialize Runner
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // 6. Vector Visualization (Custom Drawing)
    Matter.Events.on(render, 'afterRender', () => {
      if (!showVectors) return;
      const context = render.context;
      const bodies = Matter.Composite.allBodies(world);

      bodies.forEach(body => {
        if (body.isStatic) return;

        // Velocity Vector (Green)
        context.beginPath();
        context.moveTo(body.position.x, body.position.y);
        context.lineTo(
          body.position.x + body.velocity.x * 10,
          body.position.y + body.velocity.y * 10
        );
        context.strokeStyle = '#22c55e';
        context.lineWidth = 2;
        context.stroke();

        // Acceleration Vector (Approx via force - Orange)
        context.beginPath();
        context.moveTo(body.position.x, body.position.y);
        context.lineTo(
          body.position.x + (body.force.x / body.mass) * 1000,
          body.position.y + (body.force.y / body.mass) * 1000
        );
        context.strokeStyle = '#f97316';
        context.lineWidth = 2;
        context.stroke();
      });
    });

    // 7. Cleanup
    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  // Update World settings on prop changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.world.gravity.y = gravity;
      engineRef.current.timing.timeScale = timeScale;
    }
  }, [gravity, timeScale]);

  return (
    <div ref={sceneRef} className="w-full h-full relative overflow-hidden bg-surface-container/30 backdrop-blur-sm rounded-3xl border border-white/5">
      <div className="absolute top-6 left-6 flex items-center gap-4 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-highest/80 border border-white/10 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Engine Active
        </div>
        <div className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
          Matter.js v0.19.0
        </div>
      </div>
    </div>
  );
};

export default PhysicsCanvas;
