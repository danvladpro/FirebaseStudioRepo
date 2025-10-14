
import { Building, User, TrendingUp, Briefcase } from 'lucide-react';
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
                    Boost Your Productivity:
                  </span>{' '}
                  Research indicates that mastering keyboard shortcuts can save
                  you up to 8 workdays a year. That's time you can reinvest in
                  deeper, more strategic work.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                <p>
                  <span className="font-semibold text-foreground">
                    Enhance Your Career Profile:
                  </span>{' '}
                  Listing "Advanced Excel Proficiency" on your CV is a proven
                  way to stand out. A survey of hiring managers found that 92%
                  view these skills as a significant hiring advantage.
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
                  In high-performance teams, every minute counts. Studies show
                  that proficient users complete tasks up to 50% faster,
                  translating directly to resource savings and improved project
                  timelines.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                <p>
                  <span className="font-semibold text-foreground">
                    Cultivate a High-Performance Culture:
                  </span>{' '}
                  Investing in practical skills like shortcut mastery fosters a
                  culture of efficiency and continuous improvement, empowering
                  employees to work smarter, not harder.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
