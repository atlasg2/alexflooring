/**
 * Utility functions for optimizing performance and preventing memory leaks
 */

// Global object to track component mounts/unmounts for debugging
export const componentTracker = {
  mounted: new Set<string>(),
  track: (componentName: string, isMounting: boolean) => {
    if (isMounting) {
      componentTracker.mounted.add(componentName);
    } else {
      componentTracker.mounted.delete(componentName);
    }
  },
  // For debugging, call this from console: window.checkMounted()
  checkMounted: () => {
    const mountedArray = Array.from(componentTracker.mounted);
    console.log('Currently mounted components:', mountedArray);
    return mountedArray;
  }
};

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).checkMounted = componentTracker.checkMounted;
}

/**
 * Use this hook in components with heavy resources to ensure proper cleanup
 */
export const trackComponentLifecycle = (componentName: string, mountCallback?: () => void, unmountCallback?: () => void) => {
  // Track component mounting
  componentTracker.track(componentName, true);
  if (mountCallback) mountCallback();
  
  // Return cleanup function
  return () => {
    componentTracker.track(componentName, false);
    if (unmountCallback) unmountCallback();
    
    // Force garbage collection of large objects
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
    }
  };
};

/**
 * Debounce function to prevent excessive function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * Throttle function to limit the number of function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Detects memory leaks by monitoring heap size changes
 * Only works in environments that support this API
 */
export const detectMemoryLeaks = () => {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window as any).performance) {
    const memory = (window.performance as any).memory;
    const heapSizeLimit = memory.jsHeapSizeLimit;
    const usedHeapSize = memory.usedJSHeapSize;
    
    // If heap usage is over 90% of the limit, we might have a memory leak
    if (usedHeapSize > heapSizeLimit * 0.9) {
      console.warn('Possible memory leak detected: Heap usage is over 90% of the limit');
      return true;
    }
  }
  return false;
};

/**
 * Reset idle timers when user interacts with the page
 * This helps manage resource usage for inactive tabs
 */
export const setupIdleTimer = (idleCallback: () => void, timeout = 60000) => {
  let idleTimer: ReturnType<typeof setTimeout>;
  
  const resetTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(idleCallback, timeout);
  };
  
  // Set up event listeners
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  events.forEach(event => {
    document.addEventListener(event, resetTimer, { passive: true });
  });
  
  // Initial setup
  resetTimer();
  
  // Return cleanup function
  return () => {
    clearTimeout(idleTimer);
    events.forEach(event => {
      document.removeEventListener(event, resetTimer);
    });
  };
};