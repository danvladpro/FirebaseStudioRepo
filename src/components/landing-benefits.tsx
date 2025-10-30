
import { Building, User, TrendingUp, Briefcase, BrainCircuit, ShieldCheck } from 'lucide-react';

export function LandingBenefits() {
  return (
    <section id="benefits" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
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
        <div className="mx-auto grid max-w-5xl items-start gap-12 lg:grid-cols-2">
          <div className="grid gap-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <User className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">For Individuals</h3>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground">
              <ul className="space-y-4">
                <li>
                  <strong>Save 8 Workdays a Year:</strong> Proficient users save up to two weeks per year by avoiding the 40% productivity drop from context switching.
                </li>
                <li>
                  <strong>Get Hired Faster:</strong> 82% of middle-skill jobs require digital skills like Excel. Stand out to employers.
                </li>
                <li>
                  <strong>Reduce Cognitive Load:</strong> Build muscle memory to stay focused on analysis, not on hunting for menus.
                </li>
              </ul>
            </div>
          </div>
          <div className="grid gap-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Building className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">For Companies</h3>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground">
              <ul className="space-y-4">
                <li>
                  <strong>Drive Team Efficiency:</strong> Proficient users complete tasks up to 50% faster, boosting team output significantly.
                </li>
                <li>
                  <strong>Reduce Errors:</strong> Keyboard shortcuts ensure consistent operations, improving data quality across the board.
                </li>
                <li>
                  <strong>Cultivate a High-Performance Culture:</strong> Empower employees to work smarter, not harder, fostering a culture of efficiency.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
