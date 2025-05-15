
import React from "react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 48, className = "" }) => {
  const spinnerSize = size;
  const borderWidth = Math.max(2, size * 0.1);

  return (
    <div
      role="status"
      aria-label="Se încarcă"
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: spinnerSize, height: spinnerSize }}
    >
      <div
        className="rounded-full border-t-4 border-b-4 border-black border-opacity-10 animate-spin"
        style={{
          width: spinnerSize,
          height: spinnerSize,
          borderTopColor: "#db000f",
          borderBottomColor: "#db000f",
          borderWidth: borderWidth,
        }}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
