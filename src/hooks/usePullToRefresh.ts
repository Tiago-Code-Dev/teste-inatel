import { useState, useCallback, useRef, useEffect } from 'react';
import { useSpring, useTransform } from 'framer-motion';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPull?: number;
  resistance?: number;
}

interface UsePullToRefreshReturn {
  pullDistance: number;
  isPulling: boolean;
  isRefreshing: boolean;
  progress: number;
  springY: any;
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
  };
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPull = 150,
  resistance = 0.4,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);

  const springY = useSpring(0, { 
    stiffness: 300, 
    damping: 30,
    mass: 0.8
  });

  const progress = Math.min(pullDistance / threshold, 1);

  const handleStart = useCallback((clientY: number) => {
    if (isRefreshing) return;
    
    // Only allow pull-to-refresh at the top of the page
    if (window.scrollY > 10) return;
    
    startY.current = clientY;
    isDragging.current = true;
    setIsPulling(true);
  }, [isRefreshing]);

  const handleMove = useCallback((clientY: number) => {
    if (!isDragging.current || isRefreshing) return;
    
    const diff = clientY - startY.current;
    
    if (diff > 0) {
      // Apply resistance to make it feel more natural
      const resistedDiff = diff * resistance;
      const cappedDiff = Math.min(resistedDiff, maxPull);
      
      currentY.current = cappedDiff;
      setPullDistance(cappedDiff);
      springY.set(cappedDiff);
    }
  }, [isRefreshing, resistance, maxPull, springY]);

  const handleEnd = useCallback(async () => {
    if (!isDragging.current) return;
    
    isDragging.current = false;
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      springY.set(threshold * 0.6); // Snap to refresh position
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    // Reset
    springY.set(0);
    setPullDistance(0);
    setIsPulling(false);
  }, [pullDistance, threshold, isRefreshing, onRefresh, springY]);

  // Touch handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    handleStart(e.touches[0].clientY);
  }, [handleStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    handleMove(e.touches[0].clientY);
  }, [handleMove]);

  const onTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Mouse handlers (for desktop testing)
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    handleStart(e.clientY);
  }, [handleStart]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientY);
  }, [handleMove]);

  const onMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const onMouseLeave = useCallback(() => {
    if (isDragging.current) {
      handleEnd();
    }
  }, [handleEnd]);

  return {
    pullDistance,
    isPulling,
    isRefreshing,
    progress,
    springY,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
    },
  };
}
