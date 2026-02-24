
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { User } from "firebase/auth";
import type { ChallengeStep } from "./types";
import type { DrillStep } from "./drills";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const buildLinkedInUrl = (user: User, certId: string) => {
    if (!user) return "";

    const certName = "Excel Ninja: Certificate of Mastery";
    const issueDate = new Date();
    const issueYear = issueDate.getFullYear();
    const issueMonth = issueDate.getMonth() + 1;

    const linkedInUrl = new URL("https://www.linkedin.com/profile/add");
    linkedInUrl.searchParams.append("startTask", "CERTIFICATION_NAME");
    linkedInUrl.searchParams.append("name", certName);
    // You can register your organization on LinkedIn and get an ID
    // linkedInUrl.searchParams.append("organizationId", "YOUR_LINKEDIN_ORG_ID");
    linkedInUrl.searchParams.append("issueYear", issueYear.toString());
    linkedInUrl.searchParams.append("issueMonth", issueMonth.toString());
    linkedInUrl.searchParams.append("certId", certId);
    
    // Add skills to the certificate
    linkedInUrl.searchParams.append("skills", "Keyboard Shortcuts,Microsoft Excel,Data Analysis,Productivity");
    
    // The URL to a page where someone can verify the certificate.
    const certUrl = `${window.location.origin}/verify?id=${certId}`;
    linkedInUrl.searchParams.append("certUrl", certUrl);

    return linkedInUrl.toString();
  };

export const getPlatformKeys = (step: ChallengeStep | DrillStep, isMac: boolean): string[] => {
  const keys = step.keys;
  if (!keys) return [];
  const description = step.description.toLowerCase();

  if (!isMac) {
    return keys.map(k => k.toLowerCase());
  }

  // Mac specific full overrides
  if (description.includes("autosum")) {
    return ["shift", "meta", "t"];
  }
  if (description.includes("replace all")) {
    return ['meta', 'a'];
  }

  // Keys that should remain Control on Mac and not be mapped to Cmd
  const ctrlExceptions = [
    "date format",
    "general format",
    "time format",
    "strikethrough",
    "create from selection",
    "name manager",
  ];
  const isCtrlException = ctrlExceptions.some(ex => description.includes(ex));

  return keys.map(k => {
    const lowerK = k.toLowerCase();
    if (lowerK === 'enter') return 'return';
    if (lowerK === 'control' && !isCtrlException) return 'meta';
    return lowerK;
  });
};
