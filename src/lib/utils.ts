import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ChallengeSet } from "./types";
import { User } from "firebase/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const buildLinkedInUrl = (challengeSet: ChallengeSet, user: User) => {
    if (!challengeSet || !user) return "";

    const certName = `Excel Ninja: ${challengeSet.name}`;
    const certId = `${user.uid.slice(0, 8)}-${challengeSet.id}-${Date.now()}`;
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
    
    // The URL to a page where someone can verify the certificate.
    // This could be a future feature. For now, we'll link to the dashboard.
    const certUrl = `${window.location.origin}/dashboard`;
    linkedInUrl.searchParams.append("certUrl", certUrl);

    return linkedInUrl.toString();
  };
