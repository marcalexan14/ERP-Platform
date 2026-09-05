"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 90, damping: 20, mass: 0.6 });
  const display = useTransform(spring, (v) => currency.format(v));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    return display.on("change", (v) => {
      if (ref.current) ref.current.textContent = v;
    });
  }, [display]);

  return <motion.span ref={ref}>{currency.format(0)}</motion.span>;
}
