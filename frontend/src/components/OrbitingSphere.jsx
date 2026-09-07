import React, { useEffect, useRef, useState } from 'react';

// 6 node archetypes representing the 6 discovery workflow analytical stages
const WORKFLOW_NODES = [
  { label: '01 Discover', color: '#00F0FF', baseAngle: 0, orbitRadiusX: 115, orbitRadiusY: 46, tilt: -0.28, speed: 0.007 },
  { label: '02 Structure', color: '#38BDF8', baseAngle: 1.05, orbitRadiusX: 145, orbitRadiusY: 56, tilt: 0.38, speed: 0.0055 },
  { label: '03 Cluster', color: '#8B5CF6', baseAngle: 2.1, orbitRadiusX: 175, orbitRadiusY: 66, tilt: -0.22, speed: 0.0048 },
  { label: '04 Map', color: '#C084FC', baseAngle: 3.14, orbitRadiusX: 135, orbitRadiusY: 52, tilt: 0.48, speed: 0.0062 },
  { label: '05 Compare', color: '#10B981', baseAngle: 4.2, orbitRadiusX: 160, orbitRadiusY: 62, tilt: -0.38, speed: 0.0052 },
  { label: '06 Screen', color: '#F59E0B', baseAngle: 5.25, orbitRadiusX: 125, orbitRadiusY: 48, tilt: 0.22, speed: 0.0078 },
];

export const OrbitingSphere = ({ targetSectionRef }) => {
  const canvasRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Adjust canvas size to exact viewport for crisp fixed overlay
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Subtle cursor parallax
    const handleMouseMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseRef.current.targetX = (e.clientX - cx) * 0.035;
      mouseRef.current.targetY = (e.clientY - cy) * 0.035;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let angleTick = 0;

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Mouse position smoothing
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Measure workflow section position relative to viewport
      let workflowRect = null;
      if (targetSectionRef && targetSectionRef.current) {
        workflowRect = targetSectionRef.current.getBoundingClientRect();
      }

      // Calculate scroll progress (0.0 = hero, 1.0 = workflow section in view)
      let scrollProgress = 0;
      if (workflowRect) {
        // When workflowRect.top is at window.innerHeight, progress = 0.
        // When workflowRect.top reaches ~25% of viewport, progress = 1.
        const triggerStart = height;
        const triggerEnd = height * 0.22;
        scrollProgress = Math.min(Math.max((triggerStart - workflowRect.top) / (triggerStart - triggerEnd), 0), 1);
      } else {
        const scrollY = window.scrollY || 0;
        scrollProgress = Math.min(Math.max(scrollY / 600, 0), 1);
      }

      // Check if workflow section has completely scrolled off top of screen
      let sectionAlpha = 1;
      if (workflowRect && workflowRect.bottom < 100) {
        sectionAlpha = Math.max(0, workflowRect.bottom / 100);
      }

      if (sectionAlpha <= 0.01) {
        // Section is completely out of view - conserve resources
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.save();
      ctx.globalAlpha = sectionAlpha;

      // 1. Central sphere position choreography:
      // Hero starting center:
      const heroStartX = width / 2 + (reducedMotion ? 0 : mouseRef.current.x);
      const heroStartY = Math.min(height * 0.38, 300) + (reducedMotion ? 0 : mouseRef.current.y);

      // Workflow settled center:
      let workflowCenterX = width / 2;
      let workflowCenterY = height * 0.32;
      if (workflowRect) {
        workflowCenterX = workflowRect.left + workflowRect.width / 2;
        workflowCenterY = workflowRect.top + 70; // behind workflow header
      }

      // Smoothstep interpolation for sphere movement
      const sphereMoveT = scrollProgress * scrollProgress * (3 - 2 * scrollProgress);
      const currentSphereX = heroStartX + (workflowCenterX - heroStartX) * sphereMoveT;
      const currentSphereY = heroStartY + (workflowCenterY - heroStartY) * sphereMoveT;

      // 2. Sphere scaling & opacity: settles and shrinks into background
      const baseRadius = 32;
      const settledRadius = 14;
      const currentSphereRadius = Math.max(settledRadius, baseRadius - (baseRadius - settledRadius) * sphereMoveT);
      const sphereOpacity = Math.max(0.22, 1.0 - scrollProgress * 0.72);

      if (!reducedMotion) {
        angleTick += 1;
      }

      // 3. Faint orbital tracks (fade out as scrollProgress increases)
      if (scrollProgress < 0.7) {
        const ringAlpha = (1 - scrollProgress / 0.7) * 0.22;
        ctx.save();
        ctx.translate(currentSphereX, currentSphereY);

        [115, 145, 175].forEach((r, idx) => {
          ctx.beginPath();
          ctx.ellipse(0, 0, r, r * 0.42, (idx - 1) * 0.35, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 240, 255, ${ringAlpha * (0.8 - idx * 0.2)})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 7]);
          ctx.stroke();
        });

        ctx.restore();
      }

      // 4. Query target positions for the 6 workflow cards
      // We look for DOM elements with id="workflow-card-0" through 5
      const cardTargets = [];
      for (let i = 0; i < 6; i++) {
        const cardEl = document.getElementById(`workflow-card-${i}`);
        if (cardEl) {
          const cRect = cardEl.getBoundingClientRect();
          // Anchor node near top-left of the card (near the step number / icon badge)
          cardTargets.push({
            x: cRect.left + 36,
            y: cRect.top + 36,
            cardWidth: cRect.width,
            cardHeight: cRect.height,
            visible: cRect.bottom > 0 && cRect.top < height,
          });
        } else {
          // Fallback geometric estimation if not yet mounted
          const col = i % 3;
          const row = Math.floor(i / 3);
          const colWidth = Math.min(360, width / 3.4);
          const rowHeight = 220;
          cardTargets.push({
            x: width / 2 + (col - 1) * colWidth,
            y: (workflowRect ? workflowRect.top + 160 : height * 0.6) + row * rowHeight,
            visible: true,
          });
        }
      }

      // Detachment progress (smooth ease between scrollProgress 0.12 and 0.85)
      const detachProgress = Math.min(Math.max((scrollProgress - 0.12) / 0.72, 0), 1);
      const smoothDetach = detachProgress * detachProgress * (3 - 2 * detachProgress); // cubic smoothstep

      // Calculate node positions
      const currentNodes = WORKFLOW_NODES.map((node, i) => {
        const currentAngle = node.baseAngle + (reducedMotion ? 0 : angleTick * node.speed);
        
        // Orbital coordinates relative to current sphere position
        const cos = Math.cos(currentAngle);
        const sin = Math.sin(currentAngle);
        const rotX = cos * node.orbitRadiusX;
        const rotY = sin * node.orbitRadiusY;

        const orbitX = currentSphereX + rotX * Math.cos(node.tilt) - rotY * Math.sin(node.tilt);
        const orbitY = currentSphereY + rotX * Math.sin(node.tilt) + rotY * Math.cos(node.tilt);

        const targetPos = cardTargets[i];

        // Smooth migration from orbit to card anchor
        const nodeX = orbitX + (targetPos.x - orbitX) * smoothDetach;
        const nodeY = orbitY + (targetPos.y - orbitY) * smoothDetach;

        return {
          ...node,
          x: nodeX,
          y: nodeY,
          targetX: targetPos.x,
          targetY: targetPos.y,
          index: i,
        };
      });

      // 5. Connecting lines briefly appear during detachment (Step 4 of user spec)
      // They peak around smoothDetach = 0.5 and fade out cleanly as nodes arrive at cards
      if (smoothDetach > 0.05 && smoothDetach < 0.95) {
        const lineAlpha = Math.sin(smoothDetach * Math.PI) * 0.42;

        // A. Filaments from central sphere to each separating node
        currentNodes.forEach((node) => {
          ctx.beginPath();
          ctx.moveTo(currentSphereX, currentSphereY);
          ctx.lineTo(node.x, node.y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${lineAlpha * 0.75})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 6]);
          ctx.stroke();
        });

        // B. Sequential constellation filament between adjacent workflow nodes (01 -> 02 -> 03 -> 04 -> 05 -> 06)
        ctx.beginPath();
        for (let i = 0; i < currentNodes.length - 1; i++) {
          ctx.moveTo(currentNodes[i].x, currentNodes[i].y);
          ctx.lineTo(currentNodes[i + 1].x, currentNodes[i + 1].y);
        }
        ctx.strokeStyle = `rgba(139, 92, 246, ${lineAlpha * 0.55})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 6. Render the 6 Quantum Orbital Nodes
      currentNodes.forEach((node) => {
        ctx.save();

        // Node pulse (gentle breathing when settled at card)
        const pulse = smoothDetach > 0.85 && !reducedMotion ? Math.sin(angleTick * 0.08 + node.index) * 1.5 : 0;
        const glowRadius = Math.max(8, 14 + pulse);

        // Radial glow aura
        const nodeGlow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowRadius);
        nodeGlow.addColorStop(0, node.color);
        nodeGlow.addColorStop(0.45, `${node.color}66`);
        nodeGlow.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = nodeGlow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core bright pip
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // When fully settled, draw a subtle halo ring around the node
        if (smoothDetach > 0.88) {
          const haloAlpha = (smoothDetach - 0.88) / 0.12 * 0.6;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 7 + pulse, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${haloAlpha * 0.4})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        ctx.restore();
      });

      // 7. Render the Central Scientific Sphere (Nucleus)
      ctx.save();

      // Outer radial corona aura
      const coronaRadius = currentSphereRadius * 2.8;
      const outerGlow = ctx.createRadialGradient(
        currentSphereX,
        currentSphereY,
        0,
        currentSphereX,
        currentSphereY,
        coronaRadius
      );
      outerGlow.addColorStop(0, `rgba(0, 240, 255, ${sphereOpacity * 0.45})`);
      outerGlow.addColorStop(0.5, `rgba(139, 92, 246, ${sphereOpacity * 0.22})`);
      outerGlow.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(currentSphereX, currentSphereY, coronaRadius, 0, Math.PI * 2);
      ctx.fill();

      // Inner sphere with holographic gradient
      const sphereGrad = ctx.createRadialGradient(
        currentSphereX - currentSphereRadius * 0.35,
        currentSphereY - currentSphereRadius * 0.35,
        currentSphereRadius * 0.1,
        currentSphereX,
        currentSphereY,
        currentSphereRadius
      );
      sphereGrad.addColorStop(0, '#FFFFFF');
      sphereGrad.addColorStop(0.25, '#00F0FF');
      sphereGrad.addColorStop(0.7, '#8B5CF6');
      sphereGrad.addColorStop(1, '#070A12');

      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(currentSphereX, currentSphereY, currentSphereRadius, 0, Math.PI * 2);
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 18 * sphereOpacity;
      ctx.fill();

      ctx.restore(); // end sphere
      ctx.restore(); // end sectionAlpha

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [reducedMotion, targetSectionRef]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden"
      aria-hidden="true"
    />
  );
};

export default OrbitingSphere;
