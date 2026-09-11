import Link from "next/link";
import Image from "next/image";

// inreachable ressource message page : for 404 and "not a splitter address"
export function MessagePage({
  heading,
  message,
}: {
  heading: string;
  message: string;
}) {
  return (
    <main className="mx-auto flex max-w-275 flex-col gap-6 p-8">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Image src="/logo-no-txt.svg" alt="Logo" width={38} height={38} />
          <span className="text-2xl font-mono">{heading}</span>
        </div>
        <p className="max-w-3xl text-base text-muted">{message}</p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-accent px-3 py-1.5 text-sm text-paper"
        >
          Go back home
        </Link>
      </div>
    </main>
  );
}
