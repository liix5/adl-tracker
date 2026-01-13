import { ModeToggle } from "@/components/mode-toggle";

export function Header() {
  return (
    <header className="w-full border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Left */}
        <ModeToggle />

        {/* Right */}
        <div className="font-semibold text-primary">ADL Tracker</div>
      </div>
    </header>
  );
}
