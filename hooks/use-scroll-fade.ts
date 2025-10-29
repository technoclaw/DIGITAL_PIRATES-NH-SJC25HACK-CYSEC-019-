'use client';

import { useEffect, useRef, useState } from 'react';

interface UseScrollFadeOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Custom hook for scroll-triggered fade-in and slide-up animations
 * Uses Intersection Observer API to detect when elements enter the viewport
 * 
 * @param options - Configuration options for the intersection observer
 * @returns A ref to attach to the element and a boolean indicating visibility
 * 
 * @example
 * const { ref, isVisible } = useScrollFade();
 * 
 * <div
 *   ref={ref}
 *   className={`transition-all duration-700 ease-out ${
 *     isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
 *   }`}
 * >
 *   Content
 * </div>
 */
export function useScrollFade(options: UseScrollFadeOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            
            // If triggerOnce is true, stop observing after first trigger
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            // Allow re-triggering if triggerOnce is false
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref: elementRef, isVisible };
}
