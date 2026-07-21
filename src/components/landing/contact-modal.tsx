"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Copy, Check } from "lucide-react";
import styles from "./landing.module.css";

const cx = (...keys: string[]) => keys.map((k) => styles[k]).filter(Boolean).join(" ");

const CONTACT_EMAIL = "info@ninjashortcuts.com";

interface ContactModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description: string;
  mailSubject: string;
}

function ContactModal({ isOpen, onOpenChange, title, description, mailSubject }: ContactModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — the address is visible to copy manually.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <Mail className="h-6 w-6 text-emerald-700" />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted px-4 py-3">
          <span className="select-all font-mono text-sm font-medium">{CONTACT_EMAIL}</span>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="shrink-0">
            {copied ? (
              <>
                <Check className="mr-1.5 h-4 w-4 text-emerald-600" /> Copied
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-4 w-4" /> Copy
              </>
            )}
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          <Button asChild>
            <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(mailSubject)}`}>
              <Mail className="mr-2 h-4 w-4" /> Open Email App
            </a>
          </Button>
          <p className="text-center text-xs text-muted-foreground">We typically reply within one business day.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// The <a> keeps its mailto href so the link still works without JavaScript;
// with JS, the click is intercepted and the modal opens instead.
function ContactTrigger({
  className,
  children,
  title,
  description,
  mailSubject,
}: {
  className?: string;
  children: ReactNode;
  title: string;
  description: string;
  mailSubject: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsOpen(true);
  };

  return (
    <>
      <a href={`mailto:${CONTACT_EMAIL}`} className={className} onClick={handleClick}>
        {children}
      </a>
      <ContactModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title={title}
        description={description}
        mailSubject={mailSubject}
      />
    </>
  );
}

export function ContactSalesCta() {
  return (
    <ContactTrigger
      className={cx("pricing-cta", "cta-border")}
      title="Contact Sales"
      description="Interested in Ninja Shortcuts for your team? Send us a note and we'll get back to you with custom pricing."
      mailSubject="Ninja Shortcuts — Team Inquiry"
    >
      Contact Sales
    </ContactTrigger>
  );
}

export function ContactFooterLink() {
  return (
    <ContactTrigger
      title="Get in Touch"
      description="Questions, feedback, or anything else — we'd love to hear from you."
      mailSubject="Ninja Shortcuts — Contact"
    >
      Contact
    </ContactTrigger>
  );
}
