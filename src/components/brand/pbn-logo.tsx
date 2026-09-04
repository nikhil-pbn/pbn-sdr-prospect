import Image from "next/image";

/** The full-colour wordmark, shared with PbN Proposals. Intrinsic size 4000×814. */
const SOURCE = { src: "/images/pbn-logo.png", width: 4000, height: 814 };

const VARIANTS = {
  sm: { height: "h-8", sizes: "160px" },
  md: { height: "h-10", sizes: "200px" },
  lg: { height: "h-13", sizes: "260px" },
};

export function PbnLogo({
  size = "md",
  className = "",
  eager = false,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  eager?: boolean;
}) {
  return (
    <Image
      src={SOURCE.src}
      alt="Practice by Numbers"
      width={SOURCE.width}
      height={SOURCE.height}
      priority={eager}
      sizes={VARIANTS[size].sizes}
      className={`w-auto ${VARIANTS[size].height} ${className}`}
    />
  );
}
