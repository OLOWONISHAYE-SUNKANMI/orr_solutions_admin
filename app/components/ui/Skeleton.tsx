import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
}

/**
 * Base skeleton primitive: a pulsing, theme-matched block used to stand in for
 * content while it loads. The fill uses the app's `secondary` token so shimmer
 * blocks sit correctly on the dark navy / charcoal surfaces.
 */
const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = 'rect',
  width,
  height,
}) => {
  const baseStyles = "animate-pulse bg-secondary/30";
  const variantStyles = {
    rect: "rounded-lg",
    circle: "rounded-full",
    text: "rounded h-4 w-full",
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
    />
  );
};

export default Skeleton;
