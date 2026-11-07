import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="container-page flex min-h-svh flex-col items-start justify-center gap-6 font-mono">
      <p className="text-sm text-dim">
        <span className="text-accent">guest@praduman</span>:~$ curl -I {"<this page>"}
      </p>
      <h1 className="text-[clamp(3rem,10vw,7rem)] leading-none font-extrabold tracking-[-0.06em]">
        404<span className="text-accent">.</span>
      </h1>
      <p className="max-w-md text-muted">
        <span className="text-danger">Error from server (NotFound):</span> the route you requested doesn&apos;t exist. It was
        probably never deployed.
      </p>
      <Link href="/" className={buttonClass("primary")}>
        cd ~ →
      </Link>
    </main>
  );
}
