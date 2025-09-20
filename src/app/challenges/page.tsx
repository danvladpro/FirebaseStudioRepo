import Link from 'next/link';
import { ArrowLeft, ClipboardCopy, ArrowRightLeft, MousePointerSquareDashed, Pilcrow, FunctionSquare, BookMarked, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CHALLENGE_SETS } from '@/lib/challenges';
import { ChallengeSet } from '@/lib/types';
import { Logo } from '@/components/logo';

const iconMap: Record<ChallengeSet["iconName"], React.FC<React.SVGProps<SVGSVGElement>>> = {
    ClipboardCopy,
    ArrowRightLeft,
    MousePointerSquareDashed,
    Pilcrow,
    FunctionSquare,
    BookMarked,
};

export default function ChallengesPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <main className="flex-1 container py-8 md:py-12">
            <header className="mb-8 md:mb-12 flex items-center justify-between">
                <div>
                    <Logo />
                    <p className="text-muted-foreground mt-2">
                        Choose a set to practice your skills.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </header>

            <section>
                <h2 className="text-2xl font-bold mb-6">Choose Your Challenge</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CHALLENGE_SETS.map((set) => {
                    const Icon = iconMap[set.iconName];
                    return (
                    <Card key={set.id} className="flex flex-col">
                        <CardHeader className="flex-row gap-4 items-center">
                        <Icon className="w-10 h-10 text-primary" />
                        <div>
                            <CardTitle>{set.name}</CardTitle>
                            <CardDescription>{set.description}</CardDescription>
                        </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground font-semibold">{set.category}</p>
                        </CardContent>
                        <CardFooter>
                        <Button asChild className="w-full">
                            <Link href={`/challenge/${set.id}`}>
                            Start Challenge <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        </CardFooter>
                    </Card>
                    )})}
                </div>
            </section>
        </main>
    </div>
  );
}
