'use client';

import { useEffect, useState } from 'react';

export default function Typewriter({ phrases, typeSpeed = 70, deleteSpeed = 38, pause = 1800 }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(phrases[0]);
  const [deleting, setDeleting] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => {
      setStarted(true);
      setDeleting(true);
    }, pause);
    return () => clearTimeout(t);
  }, [pause]);

  useEffect(() => {
    if (!started) return;
    const current = phrases[index];
    let t;
    if (!deleting && text === current) {
      t = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text === '') {
      t = setTimeout(() => {
        setDeleting(false);
        setIndex((i) => (i + 1) % phrases.length);
      }, 350);
    } else if (deleting) {
      t = setTimeout(() => setText(text.slice(0, -1)), deleteSpeed);
    } else {
      t = setTimeout(() => setText(current.slice(0, text.length + 1)), typeSpeed);
    }
    return () => clearTimeout(t);
  }, [started, text, deleting, index, phrases, pause, typeSpeed, deleteSpeed]);

  return (
    <span className="inline-block">
      <span>{text}</span>
      <span
        aria-hidden="true"
        className="inline-block w-[3px] h-[0.9em] align-[-0.1em] ml-1 rounded-sm animate-pulse motion-reduce:animate-none"
        style={{ background: 'currentColor' }}
      />
      <span className="sr-only">{phrases[0]}</span>
    </span>
  );
}
