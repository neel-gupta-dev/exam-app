"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Matter from 'matter-js';
import * as gtag from '@/lib/gtag';

export interface PhysicsCanvasHandle {
  launch: (velocity: number, angle: number) => void;
  clearDynamic: () => void;
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
  isStopwatchRunning?: boolean;
  stopwatchTime?: number;
  onStopwatchUpdate?: (time: number) => void;
  setIsStopwatchRunning?: (isRunning: boolean) => void;
  activePreset?: string | null;
  cradleCount?: number;
  massA?: number;
  massB?: number;
  velA?: number;
  velB?: number;
  rampAngle?: number;
  rampFriction?: number;
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
  isStopwatchRunning = false,
  stopwatchTime = 0,
  onStopwatchUpdate,
  setIsStopwatchRunning,
  activePreset,
  cradleCount = 5,
  massA = 1,
  massB = 1,
  velA = 5,
  velB = -5,
  rampAngle = 30,
  rampFriction = 0.1,
}, ref) => {
  // ── Engine refs ──
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const wallsRef = useRef<Matter.Body[]>([]);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  // ── Prop refs (avoid stale closures in engine callbacks) ──
  const showVectorsRef = useRef(showVectors);
  const isDeleteModeRef = useRef(isDeleteMode);
  const airResistanceRef = useRef(airResistance);
  const restitutionRef = useRef(restitution);
  const nextMassRef = useRef(nextMass);
  const frictionRef = useRef(friction);
  const onStopwatchUpdateRef = useRef(onStopwatchUpdate);
  const setIsStopwatchRunningRef = useRef(setIsStopwatchRunning);

  // ── Stopwatch refs ──
  const stopwatchActiveRef = useRef(false);
  const simulatedTimeRef = useRef(0);

  // Keep prop refs in sync (runs every render, no deps needed)
  useEffect(() => {
    showVectorsRef.current = showVectors;
    isDeleteModeRef.current = isDeleteMode;
    airResistanceRef.current = airResistance;
    restitutionRef.current = restitution;
    nextMassRef.current = nextMass;
    frictionRef.current = friction;
    onStopwatchUpdateRef.current = onStopwatchUpdate;
    setIsStopwatchRunningRef.current = setIsStopwatchRunning;
  });

  // Sync stopwatch active state with parent's isStopwatchRunning prop
  useEffect(() => {
    stopwatchActiveRef.current = isStopwatchRunning;
  }, [isStopwatchRunning]);

  // When parent resets stopwatch display to 0, also zero the internal accumulator
  useEffect(() => {
    if (stopwatchTime === 0) {
      simulatedTimeRef.current = 0;
    }
  }, [stopwatchTime]);

  // ── Preset Observer & Builder ──
  useEffect(() => {
    if (!engineRef.current) return;
    
    // Clear EVERYTHING except the 4 boundary walls
    const allBodies = Matter.Composite.allBodies(engineRef.current.world);
    const toRemoveBodies = allBodies.filter(b => !wallsRef.current.includes(b));
    toRemoveBodies.forEach(b => Matter.Composite.remove(engineRef.current!.world, b));
    
    // Remove all constraints
    const allConstraints = Matter.Composite.allConstraints(engineRef.current.world);
    const toRemoveConstraints = allConstraints.filter(c => c.label !== 'Mouse Constraint');
    toRemoveConstraints.forEach(c => Matter.Composite.remove(engineRef.current!.world, c));

    const { width, height } = dimensionsRef.current;
    
    // Auto-reset stopwatch
    simulatedTimeRef.current = 0;
    onStopwatchUpdateRef.current?.(0);

    if (activePreset === "Newton's Cradle") {
      const cradle = Matter.Composites.newtonsCradle(width / 2 - (cradleCount * 50) / 2, 100, cradleCount, 25, 200);
      // Make them bouncy and frictionless
      cradle.bodies.forEach(b => {
        b.restitution = 1;
        b.friction = 0;
        b.frictionAir = 0;
        b.render.fillStyle = '#f472b6';
      });
      Matter.Composite.add(engineRef.current.world, cradle);
    } 
    else if (activePreset === "Collision Track") {
      const yPos = height - 200;
      const blockA = Matter.Bodies.rectangle(width / 2 - 200, yPos, 60, 60, {
        mass: massA,
        render: { fillStyle: '#f97316' },
        friction: 0, frictionAir: 0, restitution: 1
      });
      const blockB = Matter.Bodies.rectangle(width / 2 + 200, yPos, 60, 60, {
        mass: massB,
        render: { fillStyle: '#38bdf8' },
        friction: 0, frictionAir: 0, restitution: 1
      });
      Matter.Body.setVelocity(blockA, { x: velA, y: 0 });
      Matter.Body.setVelocity(blockB, { x: velB, y: 0 });
      Matter.Composite.add(engineRef.current.world, [blockA, blockB]);
      
      stopwatchActiveRef.current = true;
      setIsStopwatchRunningRef.current?.(true);
    }
    else if (activePreset === "Inclined Plane") {
      const radians = (rampAngle * Math.PI) / 180;
      const rampLength = 800;
      const rampThickness = 40;
      
      const ramp = Matter.Bodies.rectangle(width / 2, height - 200, rampLength, rampThickness, {
        isStatic: true,
        angle: radians,
        friction: rampFriction,
        render: { fillStyle: '#a855f7' },
        label: 'Ramp'
      });
      
      const blockX = width / 2 - Math.cos(radians) * (rampLength / 2 - 50) - Math.sin(radians) * 40;
      const blockY = height - 200 - Math.sin(radians) * (rampLength / 2 - 50) + Math.cos(radians) * 40;

      const block = Matter.Bodies.rectangle(blockX, blockY, 50, 50, {
        friction: rampFriction,
        render: { fillStyle: '#34d399' },
        angle: radians
      });
      
      Matter.Composite.add(engineRef.current.world, [ramp, block]);
      
      stopwatchActiveRef.current = true;
      setIsStopwatchRunningRef.current?.(true);
    }

  }, [activePreset, cradleCount, massA, massB, velA, velB, rampAngle, rampFriction]);

  // ── Imperative API ──
  useImperativeHandle(ref, () => ({
    launch: (velocity: number, angle: number) => {
      if (!engineRef.current) return;

      const { width, height } = dimensionsRef.current;
      const startX = 100;
      const startY = height - 100;
      const radians = (angle * Math.PI) / 180;
      const vx = velocity * Math.cos(radians);
      const vy = -velocity * Math.sin(radians);

      const projectile = Matter.Bodies.circle(startX, startY, 15, {
        restitution: restitutionRef.current,
        friction: 0.01,
        frictionAir: airResistanceRef.current,
        render: { fillStyle: '#fbbf24' },
        label: 'Projectile'
      });

      Matter.Body.setVelocity(projectile, { x: vx, y: vy });
      Matter.Composite.add(engineRef.current.world, projectile);

      // Reset & start stopwatch
      simulatedTimeRef.current = 0;
      stopwatchActiveRef.current = true;
      onStopwatchUpdateRef.current?.(0);
      setIsStopwatchRunningRef.current?.(true);

      gtag.event({
        action: 'projectile_launch',
        category: 'Experiment',
        label: `v=${velocity}, a=${angle}`,
        value: velocity
      });
    },
    clearDynamic: () => {
      if (!engineRef.current) return;
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      const toRemove = bodies.filter(b => !b.isStatic);
      toRemove.forEach(body => {
        Matter.Composite.remove(engineRef.current!.world, body);
      });
    }
  }));

  // ── Main engine setup (runs once) ──
  useEffect(() => {
    if (!sceneRef.current) return;

    const container = sceneRef.current;
    const engine = Matter.Engine.create({ enableSleeping: true });
    engineRef.current = engine;

    const width = container.clientWidth;
    const height = container.clientHeight;
    dimensionsRef.current = { width, height };

    const render = Matter.Render.create({
      element: container,
      engine,
      options: {
        width,
        height,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio,
        showSleeping: false
      }
    });
    renderRef.current = render;

    // ── Walls ──
    const wallOptions = { isStatic: true, render: { fillStyle: '#000000' } };
    const ground = Matter.Bodies.rectangle(width / 2, height + 498, width * 2, 1000, { ...wallOptions, friction: frictionRef.current });
    const ceiling = Matter.Bodies.rectangle(width / 2, -498, width * 2, 1000, wallOptions);
    const leftWall = Matter.Bodies.rectangle(-498, height / 2, 1000, height * 10, wallOptions);
    const rightWall = Matter.Bodies.rectangle(width + 498, height / 2, 1000, height * 10, wallOptions);
    wallsRef.current = [ground, ceiling, leftWall, rightWall];

    // ── Initial demo objects ──
    const boxA = Matter.Bodies.rectangle(width / 2 - 100, 200, 80, 80, { 
      render: { fillStyle: '#4f46e5' }, restitution: 0.6, frictionAir: 0.01
    });
    const boxB = Matter.Bodies.rectangle(width / 2 + 100, 100, 80, 80, { 
      render: { fillStyle: '#6366f1' }, restitution: 0.6, frictionAir: 0.01
    });
    const ball = Matter.Bodies.circle(width / 2, 50, 40, { 
      render: { fillStyle: '#c0c1ff' }, restitution: 0.8, friction: 0.05, frictionAir: 0.01
    });

    Matter.Composite.add(engine.world, [...wallsRef.current, boxA, boxB, ball]);

    // ── Mouse control ──
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } }
    });
    Matter.Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    // ── Click to Spawn / Delete ──
    const handleCanvasClick = (event: MouseEvent) => {
      if (!engineRef.current) return;
      const { offsetX, offsetY } = event;
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      const clickedBodies = Matter.Query.point(bodies, { x: offsetX, y: offsetY });

      // Delete mode
      if (isDeleteModeRef.current) {
        clickedBodies.forEach(body => {
          if (!body.isStatic && engineRef.current) {
            Matter.Composite.remove(engineRef.current.world, body);
          }
        });
        return;
      }

      // Don't spawn if clicking on an existing dynamic body (user wants to drag)
      if (clickedBodies.some(b => !b.isStatic)) return;

      const isCircle = Math.random() > 0.5;
      const newBody = isCircle 
        ? Matter.Bodies.circle(offsetX, offsetY, 20 + Math.random() * 20, {
            render: { fillStyle: Math.random() > 0.5 ? '#4f46e5' : '#c0c1ff' },
            restitution: restitutionRef.current,
            frictionAir: airResistanceRef.current,
          })
        : Matter.Bodies.rectangle(offsetX, offsetY, 30 + Math.random() * 30, 30 + Math.random() * 30, {
            render: { fillStyle: Math.random() > 0.5 ? '#6366f1' : '#dde6f2' },
            restitution: restitutionRef.current,
            frictionAir: airResistanceRef.current,
          });

      // Fix Bug 2: Matter.js ignores mass in options — must set after creation
      Matter.Body.setMass(newBody, nextMassRef.current);
      Matter.Composite.add(engine.world, newBody);

      gtag.event({ action: 'object_spawn', category: 'Sandbox', label: isCircle ? 'Circle' : 'Box' });
    };

    render.canvas.addEventListener('mousedown', handleCanvasClick);

    // Touch support for mobile — spawn/delete on tap
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      const rect = render.canvas.getBoundingClientRect();
      const offsetX = touch.clientX - rect.left;
      const offsetY = touch.clientY - rect.top;
      // Reuse the same logic as mousedown via a synthetic-like call
      handleCanvasClick({ offsetX, offsetY } as MouseEvent);
    };
    render.canvas.addEventListener('touchstart', handleTouchStart, { passive: true });

    // ── Right Click to Delete ──
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

    // ── Runner ──
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // ── Stopwatch: uses simulation time, not wall-clock (Bug 4 fix) ──
    Matter.Events.on(engine, 'beforeUpdate', () => {
      if (stopwatchActiveRef.current) {
        simulatedTimeRef.current += (engine.timing.lastDelta / 1000);
        onStopwatchUpdateRef.current?.(simulatedTimeRef.current);
      }
    });

    // Impact detection → auto-stop stopwatch
    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        if ((bodyA.label === 'Projectile' && bodyB.isStatic) || 
            (bodyB.label === 'Projectile' && bodyA.isStatic)) {
          stopwatchActiveRef.current = false;
          setIsStopwatchRunningRef.current?.(false);
        }
      });
    });

    // ── Vector Visualization ──
    const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string) => {
      const headLength = 10;
      const dx = toX - fromX;
      const dy = toY - fromY;
      const angle = Math.atan2(dy, dx);
      if (Math.sqrt(dx * dx + dy * dy) < 5) return;

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    Matter.Events.on(render, 'afterRender', () => {
      const context = render.context;
      
      // Draw constraints (like strings in Newton's Cradle) explicitly to ensure they look good
      const engineConstraints = Matter.Composite.allConstraints(engine.world);
      context.beginPath();
      engineConstraints.forEach(constraint => {
        if (constraint.label === "Mouse Constraint") return;
        if (constraint.render && constraint.render.visible === false) return;
        
        const posA = constraint.bodyA ? 
          { x: constraint.bodyA.position.x + constraint.pointA.x, y: constraint.bodyA.position.y + constraint.pointA.y } : 
          constraint.pointA;
        const posB = constraint.bodyB ? 
          { x: constraint.bodyB.position.x + constraint.pointB.x, y: constraint.bodyB.position.y + constraint.pointB.y } : 
          constraint.pointB;
          
        if (posA && posB) {
          context.moveTo(posA.x, posA.y);
          context.lineTo(posB.x, posB.y);
        }
      });
      context.lineWidth = 2;
      context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      context.stroke();

      if (!showVectorsRef.current) return;
      
      const allBodies = Matter.Composite.allBodies(engine.world);
      // Use live dimensions from ref (Bug 5 fix)
      const currentHeight = dimensionsRef.current.height;

      allBodies.forEach(body => {
        if (body.isStatic) return;

        // Velocity vector (green)
        drawArrow(context, body.position.x, body.position.y,
          body.position.x + body.velocity.x * 10,
          body.position.y + body.velocity.y * 10,
          '#22c55e'
        );

        // Force/acceleration vector (orange)
        drawArrow(context, body.position.x, body.position.y,
          body.position.x + (body.force.x / body.mass) * 1000,
          body.position.y + (body.force.y / body.mass) * 1000,
          '#f97316'
        );

        // Projectile range/height visualization
        if (body.label === 'Projectile') {
          if ((body as any).stoppedAt === undefined) (body as any).stoppedAt = null;
          if ((body as any).shouldHide === undefined) (body as any).shouldHide = false;

          if (body.speed < 0.2) {
            if (!(body as any).stoppedAt) (body as any).stoppedAt = Date.now();
          } else {
            (body as any).stoppedAt = null;
            (body as any).shouldHide = false;
          }

          if ((body as any).stoppedAt && Date.now() - (body as any).stoppedAt > 3000) {
            (body as any).shouldHide = true;
          }

          if (!(body as any).shouldHide) {
            const launchX = 100;
            const launchY = currentHeight - 100;
            const currentX = body.position.x;
            const currentY = body.position.y;
            const pxToM = 0.02;
            const rangeM = (currentX - launchX) * pxToM;
            const heightM = (launchY - currentY) * pxToM;

            context.setLineDash([5, 5]);
            context.lineWidth = 1;

            context.beginPath();
            context.moveTo(launchX, launchY);
            context.lineTo(currentX, launchY);
            context.strokeStyle = 'rgba(34, 197, 94, 0.5)';
            context.stroke();

            context.beginPath();
            context.moveTo(currentX, launchY);
            context.lineTo(currentX, currentY);
            context.strokeStyle = 'rgba(251, 191, 36, 0.5)';
            context.stroke();

            context.setLineDash([]);
            context.font = 'bold 10px Inter';
            context.fillStyle = '#22c55e';
            context.fillText(`R: ${rangeM.toFixed(2)}m`, launchX + (currentX - launchX) / 2 - 20, launchY + 15);
            context.fillStyle = '#fbbf24';
            context.fillText(`H: ${heightM.toFixed(2)}m`, currentX + 5, launchY - (launchY - currentY) / 2);
          }
        }
      });
    });

    // ── Resize Observer (Bug 8 fix) ──
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const { width: nw, height: nh } = entry.contentRect;
      if (nw === 0 || nh === 0) return;

      dimensionsRef.current = { width: nw, height: nh };
      render.canvas.width = nw * window.devicePixelRatio;
      render.canvas.height = nh * window.devicePixelRatio;
      render.options.width = nw;
      render.options.height = nh;

      // Reposition walls to match new size
      const [gnd, ceil, left, right] = wallsRef.current;
      if (gnd) Matter.Body.setPosition(gnd, { x: nw / 2, y: nh + 498 });
      if (ceil) Matter.Body.setPosition(ceil, { x: nw / 2, y: -498 });
      if (left) Matter.Body.setPosition(left, { x: -498, y: nh / 2 });
      if (right) Matter.Body.setPosition(right, { x: nw + 498, y: nh / 2 });
    });
    resizeObserver.observe(container);

    // ── Cleanup (Bug 20 fix — remove all listeners) ──
    return () => {
      resizeObserver.disconnect();
      render.canvas.removeEventListener('mousedown', handleCanvasClick);
      render.canvas.removeEventListener('touchstart', handleTouchStart);
      render.canvas.removeEventListener('contextmenu', handleContextMenu);
      Matter.Events.off(engine, 'beforeUpdate');
      Matter.Events.off(engine, 'collisionStart');
      Matter.Events.off(render, 'afterRender');
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  // ── Update world settings on prop changes ──
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.world.gravity.y = gravity / 9.80665;
      engineRef.current.timing.timeScale = timeScale;
    }

    // Update ground friction + restitution
    const ground = wallsRef.current[0];
    if (ground) {
      ground.friction = friction;
      ground.restitution = restitution;
    }

    // Update all dynamic bodies
    if (engineRef.current) {
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      bodies.forEach(body => {
        if (!body.isStatic) {
          body.frictionAir = airResistance;
          body.restitution = restitution;
        }
      });
    }
  }, [gravity, timeScale, friction, airResistance, restitution]);

  return (
    <div 
      ref={sceneRef} 
      className={`flex-1 w-full relative overflow-hidden bg-surface-container/30 backdrop-blur-sm rounded-3xl border border-white/5 transition-all ${
        isDeleteMode ? 'cursor-crosshair ring-2 ring-error/20' : 'cursor-default'
      }`}
    >
      <div className="absolute top-6 left-6 flex items-center gap-4 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-highest/80 border border-white/10 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Engine Active
        </div>
        <div className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
          Matter.js v0.20.0
        </div>
      </div>
    </div>
  );
});

PhysicsCanvas.displayName = 'PhysicsCanvas';

export default PhysicsCanvas;
