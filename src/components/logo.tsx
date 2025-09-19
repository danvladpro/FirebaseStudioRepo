import { Keyboard } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Keyboard className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-bold tracking-tighter">Excel Ninja</h1>
    </div>
  );
}
