
import { Building, User, TrendingUp, Briefcase, BrainCircuit, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

export function LandingBenefits() {
  return (
    <section id="benefits" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
            The Science of Speed
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Unlock Tangible Results
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Investing in keyboard shortcut proficiency isn't just about
            convenience. It's a data-backed strategy for significant gains in
            productivity and career growth.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <User className="h-6 w-6" />
              </div>
              <CardTitle>For Individuals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <TrendingUp className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                <p>
                  <span className="font-semibold text-foreground">
                    Save 8 Workdays a Year:
                  </span>{' '}
                  The American Psychological Association notes that even brief mental blocks from switching tasks (like from keyboard to mouse) can cut productivity by 40%. Proficient users save up to two weeks per year.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                <p>
                  <span className="font-semibold text-foreground">
                    Get Hired Faster:
                  </span>{' '}
                  A study by Capitalize Analytics found that 82% of jobs in middle-skill positions require digital skills like Excel. Listing advanced proficiency on your resume makes you a more attractive candidate.
                </p>
              </div>
               <div className="flex items-start gap-3">
                <BrainCircuit className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                <p>
                  <span className="font-semibold text-foreground">
                    Reduce Cognitive Load:
                  </span>{' '}
                  By committing shortcuts to muscle memory, you reduce the mental effort of hunting through menus, allowing you to stay focused on the analytical task itself.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Building className="h-6 w-6" />
              </div>
              <CardTitle>For Companies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <TrendingUp className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                <p>
                  <span className="font-semibold text-foreground">
                    Drive Team Efficiency:
                  </span>{' '}
                  According to Forrester Research, proficient users complete tasks up to 50% faster. In a team of 10, that's like adding an extra team member for every 10 people, without the cost.
                </p>
              </div>
               <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                <p>
                  <span className="font-semibold text-foreground">
                    Reduce Errors & Ensure Consistency:
                  </span>{' '}
                  Using keyboard shortcuts for tasks like formatting or data entry ensures that operations are performed consistently, reducing human error and improving data quality across the board.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                <p>
                  <span className="font-semibold text-foreground">
                    Cultivate a High-Performance Culture:
                  </span>{' '}
                  Investing in practical skills like shortcut mastery fosters a culture of efficiency and continuous improvement, empowering employees to work smarter, not harder.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
