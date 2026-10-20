'use client';

import { useEffect, useRef } from 'react';

export default function HeroScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let disposed = false;
    let raf = 0;
    let renderer = null;
    let observer = null;
    let scene = null;

    (async () => {
      const THREE = await import('three');
      if (disposed) return;

      scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
      camera.position.z = 14;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.style.display = 'block';
      container.appendChild(renderer.domElement);

      const count = 700;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 42;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 28;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 22;
      }
      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particles = new THREE.Points(
        particleGeo,
        new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.07, transparent: true, opacity: 0.6 })
      );
      scene.add(particles);

      const resize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      observer = new ResizeObserver(resize);
      observer.observe(container);

      const clock = new THREE.Clock();
      function frame() {
        const t = clock.getElapsedTime();
        particles.rotation.y = t * 0.03;
        particles.rotation.x = Math.sin(t * 0.1) * 0.08;
        renderer.render(scene, camera);
        if (!reduce) raf = requestAnimationFrame(frame);
      }
      frame();
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      if (scene) {
        scene.traverse((obj) => {
          obj.geometry?.dispose();
          obj.material?.dispose();
        });
      }
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />;
}
