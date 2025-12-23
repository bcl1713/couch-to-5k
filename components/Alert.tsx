import React from "react";

interface AlertProps {
  children: React.ReactNode;
  variant?: "error" | "warning";
}

export function Alert({ children, variant = "warning" }: AlertProps) {
  const variantStyles = {
    error: "bg-red-100 border border-red-400 text-red-700 px-4 py-3",
    warning:
      "bg-yellow-50 border border-yellow-200 text-yellow-800 mb-4 p-3 text-sm",
  };

  return <div className={`rounded ${variantStyles[variant]}`}>{children}</div>;
}
