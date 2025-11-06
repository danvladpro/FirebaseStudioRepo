
import { Building, User, Check } from 'lucide-react';
import { ScrollAnimation } from "./scroll-animation";
import Image from "next/image";

export function LandingBenefits() {

  const cacheBuster = `?t=${new Date().getTime()}`;


  return (
    <section id="benefits" className="w-full py-12 md:py-24 lg:py-12">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                Gamified Learning
            </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <ScrollAnimation delay={0.2}>
            <Image
              src={`/allNinjas.png${cacheBuster}`}
              alt="Gamified Progress Levels"
              width={800}
              height={400}
              className="mx-auto"
              unoptimized
            />
          </ScrollAnimation>
          <ScrollAnimation delay={0.4}>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Real Progress You Can See</h2>
              <p className="text-muted-foreground md:text-lg">
                The more you train, the higher you climb — from Rookie to Excel Ninja.
              </p>
              <ul className="grid gap-2 text-muted-foreground md:text-lg">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <span>Earn XP for every challenge set you master.</span>
                </li>
                 <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <span>Unlock new ranks and watch your ninja evolve.</span>
                </li>
                 <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <span>Push your shortcut speed to the limit with timed challenges.</span>
                </li>
              </ul>
            </div>
          </ScrollAnimation>
        </div>
      </div>

      <div className="container px-4 md:px-6 mt-24">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
            The Science of Speed
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Unlock Tangible Results
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Investing in keyboard shortcut proficiency isn't just about
            convenience—it's a data-backed strategy for significant gains in
            productivity and career growth.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-12 lg:grid-cols-2">
           <ScrollAnimation delay={0.4}>
          <div className="grid gap-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <User className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">For Individuals</h3>
            </div>
            <ul className="grid gap-4 text-sm text-muted-foreground">
              <li>
                <strong>Boost Productivity:</strong> Proficient users save an
                average of 2 seconds per minute. That adds up to 8 workdays a year.
              </li>
              <li>
                <strong>Get Hired Faster:</strong> 82% of middle-skill jobs require digital
                skills like Excel. Stand out to employers.
              </li>
              <li>
                <strong>Reduce Cognitive Load:</strong> Build muscle memory to stay in
                the flow and focus on analysis, not on hunting for menus.
              </li>
            </ul>
          </div>
           </ScrollAnimation>
          
           <ScrollAnimation delay={0.4}>
          <div className="grid gap-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Building className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">For Companies</h3>
            </div>
            <ul className="grid gap-4 text-sm text-muted-foreground">
              <li>
                <strong>Drive Team Efficiency:</strong> Proficient users complete
                tasks up to 50% faster, boosting team output significantly.
              </li>
              <li>
                <strong>Reduce Errors:</strong> Keyboard-driven operations are more
                consistent, improving data quality across the board.
              </li>
              <li>
                <strong>Cultivate a High-Performance Culture:</strong> Empower
                employees to work smarter, not harder.
              </li>
            </ul>
          </div>
          </ScrollAnimation>
          
        </div>
      </div>
    
    </section>
  );
}
