import Image from "next/image";

import { cn } from "@/shared/lib/cn";

export type AvatarTone =
  | "default"
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "neutral";

const toneClass: Record<AvatarTone, string> = {
  default: "bg-tertiary-container text-on-tertiary-container",
  blue: "bg-cowork-blue-500 text-white",
  green: "bg-cowork-green-500 text-white",
  amber: "bg-cowork-amber-500 text-white",
  red: "bg-primary text-on-primary",
  neutral: "bg-cowork-neutral-500 text-white",
};

export type AvatarShape = "circle" | "squircle";

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  shape?: AvatarShape;
  tone?: AvatarTone;
  loading?: "eager" | "lazy";
  className?: string;
}

export function Avatar({
  src,
  name,
  size = 40,
  shape = "squircle",
  tone = "default",
  loading = "lazy",
  className,
}: AvatarProps) {
  const initials = name ? name.trim().slice(0, 2).toUpperCase() : "";

  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: shape === "circle" ? "9999px" : size * 0.28,
        fontSize: Math.round(size * 0.33),
      }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden font-bold",
        toneClass[tone],
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name ?? ""}
          width={size}
          height={size}
          loading={loading}
          className="size-full object-cover"
        />
      ) : (
        initials
      )}
    </span>
  );
}
