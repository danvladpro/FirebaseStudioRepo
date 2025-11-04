"use client";

import { useRef, useEffect, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ScrollAnimationProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function ScrollAnimation({ children, delay = 0, className }: ScrollAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 👇 Toggle visibility both ways
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        });
      },
      {
        threshold: 0.2, // visible when 20% in viewport
      }
    );

    const el = ref.current;
    if (el) observer.observe(el);
    return () => el && observer.unobserve(el);
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-5 scale-95",
        className
      )}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
