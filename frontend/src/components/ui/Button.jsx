import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState } from "react";

export default function Button({ className = "", children, ...props }) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (props.disabled) return;

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    props.onClick?.(e);
  };

  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group";

  return (
    <motion.button
      whileHover={{
        scale: 1.04,
        y: -2,
      }}
      whileTap={{ scale: 0.96, y: -1 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      className={`${base} ${className}`}
      {...props}
      onClick={handleClick}
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 opacity-0 group-hover:opacity-100"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ backgroundSize: "200% 200%" }}
      />

      {/* Animated shine effect */}
      <motion.span
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: "-100%", opacity: 0 }}
        whileHover={{
          x: "200%",
          opacity: [0, 0.6, 0],
          transition: { duration: 0.8, ease: "easeInOut" },
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
      />

      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white rounded-full pointer-events-none"
          initial={{
            width: 0,
            height: 0,
            opacity: 0.5,
            x: ripple.x,
            y: ripple.y,
          }}
          animate={{
            width: ripple.size * 2,
            height: ripple.size * 2,
            opacity: 0,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}

      {/* Pulsing border glow */}
      <motion.div
        className="absolute inset-0 rounded-lg border-2 border-white/0 group-hover:border-white/30"
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
