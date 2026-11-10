import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gig Radar",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

/** Private tool shell: no boot screen, no portfolio chrome, just a quiet grid. */
export default function RadarLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="bg-grid mask-fade-top absolute inset-0 opacity-70" />
      </div>
      {children}
    </>
  );
}
