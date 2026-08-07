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
  className?: string;
}

export function Avatar({
  src,
  name,
  size = 40,
  shape = "squircle",
  tone = "default",
  className,
}: AvatarProps) {
  const initials = name ? name.trim().slice(1, 3).toUpperCase() : "";

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
        <img src={src} alt={name ?? ""} className="size-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}
