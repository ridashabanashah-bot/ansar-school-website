interface Props {
  /** Color of the wave fill (Tailwind class like "fill-warmth-50"). */
  fillClass?: string;
  /** Whether to flip vertically (use when transitioning into a colored section below). */
  flip?: boolean;
}

export default function SectionDivider({ fillClass = "fill-white", flip = false }: Props) {
  return (
    <div className={`relative h-12 w-full overflow-hidden ${flip ? "-scale-y-100" : ""}`} aria-hidden>
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className={`absolute inset-0 h-full w-full ${fillClass}`}
      >
        <path d="M0,60 C240,0 480,60 720,30 C960,0 1200,60 1440,20 L1440,60 L0,60 Z" />
      </svg>
    </div>
  );
}
