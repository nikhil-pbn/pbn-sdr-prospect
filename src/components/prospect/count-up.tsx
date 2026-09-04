"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/**
 * Animated figures, as on the PbN Voice site (components/common/CountUp).
 *
 * The server renders the final value, so the figure is correct without
 * JavaScript and for anyone who asked for less motion; the animation only
 * runs the first time the figures scroll into view.
 */

/* Splits "5,000+" into "", "5,000", "+" — so the figure animates while its
   prefix and suffix stay put, whatever they are. */
const PARTS = /^(\D*)([\d.,]+)(.*)$/;

/* null means "no group above me, watch myself"; a boolean is the group's
   shared go signal. */
const StartContext = createContext<boolean | null>(null);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Wrap a row of counters to start them together. One observer, one signal, so
    every figure runs the same clock and they all land on the same frame. */
export function CountUpGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setStart(true);
      },
      { threshold: 0.4 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      <StartContext.Provider value={start}>{children}</StartContext.Provider>
    </div>
  );
}

/** Counts from zero up to the authored figure the first time it scrolls into view. */
export function CountUp({
  value,
  className,
  duration = 1600,
}: {
  value: string;
  className?: string;
  duration?: number;
}) {
  const group = useContext(StartContext);
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const element = ref.current;
    const parts = PARTS.exec(value);

    if (!element || !parts || prefersReducedMotion()) return;

    const [, prefix, digits, suffix] = parts;
    const target = Number(digits.replace(/,/g, ""));

    if (!Number.isFinite(target)) return;

    const decimals = digits.includes(".") ? digits.split(".")[1].length : 0;
    const format = (n: number) =>
      prefix +
      n.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: digits.includes(","),
      }) +
      suffix;

    let frame = 0;

    const run = () => {
      const started = performance.now();

      const step = (now: number) => {
        const progress = Math.min(1, (now - started) / duration);

        /* Eased out, so it arrives rather than stopping dead. */
        setShown(format(target * (1 - Math.pow(1 - progress, 3))));

        if (progress < 1) frame = requestAnimationFrame(step);
        else setShown(value);
      };

      frame = requestAnimationFrame(step);
    };

    /* Dropping to zero straight from the effect body would cascade renders, so
       that first paint is scheduled like every other frame. */
    const paintZero = () => {
      frame = requestAnimationFrame(() => setShown(format(0)));
    };

    /* Inside a group the parent says when; on its own, watch for itself. */
    if (group !== null) {
      if (group) run();
      else paintZero();

      return () => cancelAnimationFrame(frame);
    }

    paintZero();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        run();
      },
      { threshold: 0.4 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration, group]);

  const raised = value.endsWith("+");
  const core = raised ? value.slice(0, -1) : value;
  const shownCore = raised && shown.endsWith("+") ? shown.slice(0, -1) : shown;

  return (
    <span
      ref={ref}
      className={cn("relative inline-grid tabular-nums", className)}
    >
      {/* Reserves the final width, so the row doesn't shift while counting. */}
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {core}
      </span>
      <span className="col-start-1 row-start-1 justify-self-center">
        {shownCore}
      </span>
      {raised && <span className="absolute top-0 left-full">+</span>}
    </span>
  );
}
