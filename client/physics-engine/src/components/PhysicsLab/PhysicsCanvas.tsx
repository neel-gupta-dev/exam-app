"use client";

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import Matter from 'matter-js';
import * as gtag from '@/lib/gtag';

export interface PhysicsCanvasHandle {
  launch: (velocity: number, angle: number) => void;
}

interface PhysicsCanvasProps {
  gravity?: number;
  timeScale?: number;
  showVectors?: boolean;
  isDeleteMode?: boolean;
  friction?: number;
  airResistance?: number;
  restitution?: number;
  nextMass?: number;
  onStopwatchUpdate?: (time: number) => void;
  setIsStopwatchRunning?: (isRunning: boolean) => void;
  onStatsUpdate?: (stats: any) => void;
  preset?: string;
}

const PhysicsCanvas = forwardRef<PhysicsCanvasHandle, PhysicsCanvasProps>(({ 
  gravity = 9.79457, 
  timeScale = 1,
  showVectors = true,
  isDeleteMode = false,
  friction = 0.1,
  airResistance = 0.01,
  restitution = 0.6,
  nextMass = 1,
  onStopwatchUpdate,
  setIsStopwatchRunning,
  onStatsUpdate,
  preset
}, ref) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const groundRef = useRef<Matter.Body | null>(null);
  const showVectorsRef = useRef(showVectors);
  const isDeleteModeRef = useRef(isDeleteMode);
  const stopwatchStartTimeRef = useRef<number | null>(null);
  const lastStopwatchTimeRef = useRef<number>(0);

  useImperativeHandle(ref, () => ({
    launch: (velocity: number, angle: number) => {
      if (!engineRef.current || !sceneRef.current) return;
      
      const width = sceneRef.current.clientWidth;
      const height = sceneRef.current.clientHeight;

      // Start position (bottom left area)
      const startX = 100;
      const startY = height - 100;

      // Convert angle to radians and calculate components
      // Note: Matter.js Y is positive downwards, so we use negative sin for upward launch
      const radians = (angle * Math.PI) / 180;
      const vx = velocity * Math.cos(radians);
      const vy = -velocity * Math.sin(radians);

      const projectile = Matter.Bodies.circle(startX, startY, 15, {
        restitution: 0.5,
        friction: 0.01,
        frictionAir: airResistance,
        render: { fillStyle: '#fbbf24' }, // Amber/Yellow for projectile
        label: 'Projectile'
      });

      Matter.Body.setVelocity(projectile, { x: vx, y: vy });
      Matter.Composite.add(engineRef.current.world, projectile);

      // Reset and Start stopwatch on launch
      stopwatchStartTimeRef.current = Date.now();
      lastStopwatchTimeRef.current = 0;
      onStopwatchUpdate?.(0);
      setIsStopwatchRunning?.(true);

      // Track Launch Event
      gtag.event({
        action: 'projectile_launch',
        category: 'Experiment',
        label: `v=${velocity}, a=${angle}`,
        value: velocity
      });
    }
  }));

  useEffect(() => {
    if (!sceneRef.current) return;

    // 1. Initialize Engine & World
    const engine = Matter.Engine.create({
      enableSleeping: true // Stabilize settled objects
    });
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
        showSleeping: false // Ensure sleeping bodies don't fade
      }
    });
    renderRef.current = render;

    // 3. Create Walls (Static Bodies)
    // We use thick walls (100px) to prevent tunneling but position them so the edges are correct
    const width = sceneRef.current.clientWidth;
    const height = sceneRef.current.clientHeight;
    const wallOptions = { isStatic: true, render: { fillStyle: '#000000' } };

    // Ground: Top edge at height-2. Center = (height-2) + 500 = height + 498
    const ground = Matter.Bodies.rectangle(width / 2, height + 498, width, 1000, { ...wallOptions, friction });
    groundRef.current = ground;

    // Ceiling: Bottom edge at 2. Center = 2 - 500 = -498
    const ceiling = Matter.Bodies.rectangle(width / 2, -498, width, 1000, wallOptions);

    // Left Wall: Right edge at 2. Center = 2 - 500 = -498
    const leftWall = Matter.Bodies.rectangle(-498, height / 2, 1000, height * 10, wallOptions);

    // Right Wall: Left edge at width-2. Center = (width-2) + 500 = width + 498
    const rightWall = Matter.Bodies.rectangle(width + 498, height / 2, 1000, height * 10, wallOptions);

    // 4. Create Initial Objects (Something to see!)
    const boxA = Matter.Bodies.rectangle(width / 2 - 100, 200, 80, 80, { 
      render: { fillStyle: '#4f46e5' },
      restitution: 0.6,
      frictionAir: airResistance
    });
    const boxB = Matter.Bodies.rectangle(width / 2 + 100, 100, 80, 80, { 
      render: { fillStyle: '#6366f1' },
      restitution: 0.6,
      frictionAir: airResistance
    });
    const ball = Matter.Bodies.circle(width / 2, 50, 40, { 
      render: { fillStyle: '#c0c1ff' },
      restitution: 0.8,
      friction: 0.05,
      frictionAir: airResistance
    });

    Matter.Composite.add(world, [ground, ceiling, leftWall, rightWall, boxA, boxB, ball]);

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

    // 5. Click to Spawn / Delete Functionality
    const handleCanvasClick = (event: MouseEvent) => {
      if (!engineRef.current) return;
      const { offsetX, offsetY } = event;

      // Handle Deletion Mode
      if (isDeleteModeRef.current) {
        const bodies = Matter.Composite.allBodies(engineRef.current.world);
        const clickedBodies = Matter.Query.point(bodies, { x: offsetX, y: offsetY });
        
        clickedBodies.forEach(body => {
          if (!body.isStatic && engineRef.current) {
            Matter.Composite.remove(engineRef.current.world, body);
          }
        });
        return;
      }

      // Only spawn if we are not currently dragging an object
      if (mouseConstraint.body) return;
      const isCircle = Math.random() > 0.5;
      
      const newBody = isCircle 
        ? Matter.Bodies.circle(offsetX, offsetY, 20 + Math.random() * 20, {
            render: { fillStyle: Math.random() > 0.5 ? '#4f46e5' : '#c0c1ff' },
            restitution: restitution,
            frictionAir: airResistance,
            mass: nextMass
          })
        : Matter.Bodies.rectangle(offsetX, offsetY, 30 + Math.random() * 30, 30 + Math.random() * 30, {
            render: { fillStyle: Math.random() > 0.5 ? '#6366f1' : '#dde6f2' },
            restitution: restitution,
            frictionAir: airResistance,
            mass: nextMass
          });

      Matter.Composite.add(world, newBody);

      // Track Spawn Event
      gtag.event({
        action: 'object_spawn',
        category: 'Sandbox',
        label: isCircle ? 'Circle' : 'Box'
      });
    };

    render.canvas.addEventListener('mousedown', handleCanvasClick);

    // 6. Right Click to Delete
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      if (!engineRef.current) return;

      const { offsetX, offsetY } = event;
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      const clickedBodies = Matter.Query.point(bodies, { x: offsetX, y: offsetY });

      clickedBodies.forEach(body => {
        if (!body.isStatic && engineRef.current) {
          Matter.Composite.remove(engineRef.current.world, body);
        }
      });
    };

    render.canvas.addEventListener('contextmenu', handleContextMenu);

    // 7. Initialize Runner
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // Stopwatch Logic
    Matter.Events.on(engine, 'beforeUpdate', () => {
      if (stopwatchStartTimeRef.current) {
        const elapsed = (Date.now() - stopwatchStartTimeRef.current) / 1000;
        lastStopwatchTimeRef.current = elapsed;
        onStopwatchUpdate?.(elapsed);
      }
    });

    // Impact Detection for Stopwatch
    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        if ((bodyA.label === 'Projectile' && bodyB.isStatic) || 
            (bodyB.label === 'Projectile' && bodyA.isStatic)) {
          // Stop the stopwatch on first impact with ground/wall
          stopwatchStartTimeRef.current = null;
          setIsStopwatchRunning?.(false);
        }
      });
    });

    // 6. Vector Visualization (Custom Drawing)
    const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string) => {
      const headLength = 10;
      const dx = toX - fromX;
      const dy = toY - fromY;
      const angle = Math.atan2(dy, dx);
      
      // Don't draw if the vector is too small
      if (Math.sqrt(dx*dx + dy*dy) < 5) return;

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    Matter.Events.on(render, 'afterRender', () => {
      if (!showVectorsRef.current) return;
      const context = render.context;
      const bodies = Matter.Composite.allBodies(world);

      bodies.forEach(body => {
        if (body.isStatic) return;

        // Velocity Vector (Green)
        drawArrow(
          context, 
          body.position.x, 
          body.position.y, 
          body.position.x + body.velocity.x * 10, 
          body.position.y + body.velocity.y * 10, 
          '#22c55e'
        );

        // Acceleration Vector (Approx via force - Orange)
        drawArrow(
          context, 
          body.position.x, 
          body.position.y, 
          body.position.x + (body.force.x / body.mass) * 1000, 
          body.position.y + (body.force.y / body.mass) * 1000, 
          '#f97316'
        );

        // Projectile Specific: Range & Height Visualization
        if (body.label === 'Projectile') {
          // Initialize tracking properties if they don't exist
          if ((body as any).stoppedAt === undefined) (body as any).stoppedAt = null;
          if ((body as any).shouldHide === undefined) (body as any).shouldHide = false;

          // Check if moving
          if (body.speed < 0.2) {
            if (!(body as any).stoppedAt) (body as any).stoppedAt = Date.now();
          } else {
            (body as any).stoppedAt = null;
            (body as any).shouldHide = false;
          }

          // Check if stopped for more than 3 seconds
          if ((body as any).stoppedAt && Date.now() - (body as any).stoppedAt > 3000) {
            (body as any).shouldHide = true;
          }

          if (!(body as any).shouldHide) {
            const launchX = 100;
            const launchY = height - 100;
            const currentX = body.position.x;
            const currentY = body.position.y;

            // Scale: 50 pixels = 1 meter
            const pxToM = 0.02;
            const rangeM = (currentX - launchX) * pxToM;
            const heightM = (launchY - currentY) * pxToM;

            context.setLineDash([5, 5]);
            context.lineWidth = 1;
            
            // Horizontal Range Line
            context.beginPath();
            context.moveTo(launchX, launchY);
            context.lineTo(currentX, launchY);
            context.strokeStyle = 'rgba(34, 197, 94, 0.5)'; // Transparent Green
            context.stroke();

            // Vertical Height Line
            context.beginPath();
            context.moveTo(currentX, launchY);
            context.lineTo(currentX, currentY);
            context.strokeStyle = 'rgba(251, 191, 36, 0.5)'; // Transparent Amber
            context.stroke();

            context.setLineDash([]);
            
            // Labels
            context.font = 'bold 10px Inter';
            context.fillStyle = '#22c55e';
            context.fillText(`R: ${rangeM.toFixed(2)}m`, launchX + (currentX - launchX)/2 - 20, launchY + 15);
            
            context.fillStyle = '#fbbf24';
            context.fillText(`H: ${heightM.toFixed(2)}m`, currentX + 5, launchY - (launchY - currentY)/2);
          }
        }
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
      // Scale real-world gravity (m/s^2) to Matter.js internal units
      // Matter.js defaults to 1.0 being "standard" gravity
      engineRef.current.world.gravity.y = gravity / 9.80665;
      engineRef.current.timing.timeScale = timeScale;
    }
    if (groundRef.current) {
      groundRef.current.friction = friction;
      groundRef.current.restitution = restitution;
    }

    // Update properties for all dynamic bodies
    if (engineRef.current) {
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      bodies.forEach(body => {
        if (!body.isStatic) {
          body.frictionAir = airResistance;
          body.restitution = restitution;
        }
      });
    }

    showVectorsRef.current = showVectors;
    isDeleteModeRef.current = isDeleteMode;
  }, [gravity, timeScale, showVectors, isDeleteMode, friction, airResistance, restitution]);

  return (
    <div 
      ref={sceneRef} 
      className={`w-full h-full relative overflow-hidden bg-surface-container/30 backdrop-blur-sm rounded-3xl border border-white/5 transition-all ${
        isDeleteMode ? 'cursor-crosshair ring-2 ring-error/20' : 'cursor-default'
      }`}
    >
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
});

export default PhysicsCanvas;
