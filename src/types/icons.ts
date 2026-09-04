import type { SVGProps } from "react";

/**
 * Props every hand-drawn icon component takes — the PbN Voice convention.
 * `size` sets both dimensions; `width` / `height` override one side. Icons are
 * drawn in `currentColor`, so the surrounding text colour paints them.
 */
export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}
