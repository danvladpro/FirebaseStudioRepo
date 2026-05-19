"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LegalContent } from "@/lib/legal-content";

interface LegalSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LegalSheet({ isOpen, onOpenChange }: LegalSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="flex-shrink-0 px-6 py-4 border-b pr-12">
          <SheetTitle className="text-base">Terms &amp; Conditions / Privacy Policy</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <LegalContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
