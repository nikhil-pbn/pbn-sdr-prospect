/** The label above each block of the dashboard and the detail page. */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </h2>
  );
}
