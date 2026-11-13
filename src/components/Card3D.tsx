import React, { ReactNode } from 'react';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  enableGlare?: boolean;
  depth?: number;
  glareOpacity?: number;
  onClick?: () => void;
}

/**
 * Enterprise Card Container
 * Provides a clean, stable surface with subtle, refined border & shadow micro-interactions.
 */
export const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`transition-all duration-150 ${className}`}
    >
      {children}
    </div>
  );
};

