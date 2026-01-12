
"use client";

import { AppHeader } from "@/components/app-header";
import { DrillUI } from "@/components/drill-ui";
import { DRILL_SET, Drill } from "@/lib/drills";
import { notFound, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Loader2 } from "lucide-react";


export default function DrillPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const drill = DRILL_SET.drills.find(d => d.id === params.id);

  if (loading) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  if (!user) {
      router.push('/login');
      return null;
  }

  if (!drill) {
    notFound();
  }

  return (
    <>
        <AppHeader />
        <main className="min-h-screen w-full flex flex-col items-center justify-center bg-muted/40 p-4 pt-20">
             <div className="w-full max-w-2xl mx-auto mb-4">
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
            <DrillUI drill={drill} />
        </main>
    </>
  );
}
