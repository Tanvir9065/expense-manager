import { ICON_PATHS, iconFor } from "@/lib/icons";

// Line icon chosen from the category name (see lib/icons.ts).
// The markup comes from our own fixed icon table, never from user input.
export default function CategoryIcon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[iconFor(name)] }}
    />
  );
}
