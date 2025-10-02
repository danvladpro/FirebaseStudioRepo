import Link from "next/link";
import { Button } from "./ui/button";
import { Heart } from "lucide-react";

export function LandingDonation() {
    return (
        <section id="donate" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                        Support Excel Ninja
                    </h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        This project is a labor of love. If you find it useful, please consider making a small donation to help keep it running and ad-free.
                    </p>
                </div>
                <div className="mt-4">
                    <Button asChild size="lg">
                        <Link href="https://www.buymeacoffee.com/yourname" target="_blank">
                            <Heart className="mr-2" /> Donate
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
