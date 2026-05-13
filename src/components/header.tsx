import { ModeToggle } from "@/components/mode-toggle";
import { useTheme } from "next-themes";

export function Header() {
  const { resolvedTheme } = useTheme();

  const logoSrc =
    resolvedTheme === "dark" ? "/logo-dark-512.png" : "/logo-light-512.png";

  return (
    <header className="w-full border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6 pl-2">
        {/* Left */}

        <div className="flex items-center gap-1 font-semibold text-primary">
          <img src={logoSrc} alt="ADL Tracker logo" className="h-10 w-10" />
          <span className="text-xs ">ADL Tracker</span>
        </div>
        {/* Right */}
        <ModeToggle />
      </div>
    </header>
  );
}
