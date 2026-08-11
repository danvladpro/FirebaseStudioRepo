
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

type Platform = 'Windows' | 'Mac';

const PLATFORM_OPTIONS: { value: Platform; label: string; hint: string }[] = [
  { value: 'Windows', label: 'Windows', hint: 'Ctrl / Alt shortcuts' },
  { value: 'Mac', label: 'Mac', hint: '⌘ / ⌥ shortcuts' },
];

// Keep this list in sync with `availableKeys` in src/components/edit-profile-modal.tsx.
const MISSING_KEY_OPTIONS = ['Home', 'End', 'PageUp', 'PageDown', 'F-Keys (F1-F12)'];

interface SurveyStep {
  id: 'name' | 'keyboard';
  title: string;
  description: string;
}

const surveySteps: SurveyStep[] = [
  {
    id: 'name',
    title: 'Your Name',
    description: 'What should we call you? This is the name that will appear on your certificate.',
  },
  {
    id: 'keyboard',
    title: 'Your Keyboard',
    description: "Two quick answers and we'll tailor every shortcut, drill and on-screen keyboard to your setup. You can change this later in Settings.",
  },
];

export default function SurveyPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<Platform | ''>('');
  const [missingKeys, setMissingKeys] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<Record<string, string | undefined>>({});
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  // Google accounts arrive with a real display name — pre-fill it so those
  // users only have to confirm it. Email/password users have no displayName,
  // so this is a no-op for them. Never overwrites what the user has typed.
  useEffect(() => {
    const displayName = user?.displayName?.trim();
    if (displayName) setName(prev => prev || displayName);
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const getOS = () => {
      const userAgent = window.navigator.userAgent;
      if (userAgent.indexOf("Win") !== -1) return "Windows";
      if (userAgent.indexOf("Mac") !== -1) return "MacOS";
      if (userAgent.indexOf("Linux") !== -1) return "Linux";
      return "Other";
    };

    const getBrowser = () => {
      const userAgent = window.navigator.userAgent;
      if (userAgent.indexOf("Firefox") > -1) return "Firefox";
      if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) return "Opera";
      if (userAgent.indexOf("Trident") > -1) return "Internet Explorer";
      if (userAgent.indexOf("Edge") > -1) return "Edge";
      if (userAgent.indexOf("Chrome") > -1) return "Chrome";
      if (userAgent.indexOf("Safari") > -1) return "Safari";
      return "Other";
    };

    const os = getOS();
    // Pre-select the keyboard platform from the detected OS (user can change it).
    setPlatform(prev => prev || (os === 'MacOS' ? 'Mac' : 'Windows'));

    setAnalyticsData({
      os,
      browser: getBrowser(),
      country: "Not Detected",
    });
  }, []);

  const handleNextStep = () => {
    const currentStepInfo = surveySteps[step];

    if (currentStepInfo.id === 'name' && !name.trim()) {
      toast({
        title: "Please provide an answer",
        description: "You must provide an answer to continue.",
        variant: "destructive",
      });
      return;
    }

    if (currentStepInfo.id === 'keyboard' && !platform) {
      toast({
        title: "Please pick a keyboard",
        description: "Choose Windows or Mac so we show you the right shortcuts.",
        variant: "destructive",
      });
      return;
    }

    if (step < surveySteps.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePreviousStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleMissingKeyChange = (option: string, checked: boolean) => {
    setMissingKeys(prev => (checked ? [...prev, option] : prev.filter(item => item !== option)));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit the survey.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        name: name.trim(),
        // `survey` doubles as the completion flag that auth-provider gates on,
        // so it must always be written as a non-empty object.
        survey: {
          missingKeys,
          completedAt: new Date().toISOString(),
        },
        missingKeys,
        platform: platform === 'Mac' ? 'mac' : 'windows',
        analytics: analyticsData,
      });
      router.push('/dashboard');
    } catch {
      setIsSubmitting(false);
      toast({
        title: "Submission Failed",
        description: "There was an error saving your responses. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const currentStep = surveySteps[step];
  const isLastStep = step === surveySteps.length - 1;
  const progress = ((step + 1) / surveySteps.length) * 100;

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-3">
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-xs font-medium text-muted-foreground">
              Step {step + 1} of {surveySteps.length}
            </p>
          </div>
          <div className="space-y-1.5">
            <CardTitle>{currentStep.title}</CardTitle>
            <CardDescription>{currentStep.description}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="min-h-[280px]">
          {currentStep.id === 'name' && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g. Jane Doe"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNextStep();
                }}
              />
              <p className="text-sm text-muted-foreground">
                Use the name you&apos;d be happy to show on a certificate.
              </p>
            </div>
          )}

          {currentStep.id === 'keyboard' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Which keyboard do you use?</Label>
                <RadioGroup
                  value={platform}
                  onValueChange={(value) => setPlatform(value as Platform)}
                  className="grid grid-cols-2 gap-3"
                >
                  {PLATFORM_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`platform-${option.value}`}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50",
                        platform === option.value && "border-primary bg-primary/5"
                      )}
                    >
                      <RadioGroupItem value={option.value} id={`platform-${option.value}`} />
                      <span className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs font-normal text-muted-foreground">{option.hint}</span>
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold">Any keys missing from your keyboard?</Label>
                  <p className="text-sm text-muted-foreground">
                    Tick anything your keyboard doesn&apos;t have — we&apos;ll show you an alternative
                    route for those shortcuts. Leave it empty if you have a full-size keyboard.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {MISSING_KEY_OPTIONS.map((option) => (
                    <Label
                      key={option}
                      htmlFor={`key-${option}`}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border p-3 font-normal transition-colors hover:bg-muted/50",
                        missingKeys.includes(option) && "border-primary bg-primary/5"
                      )}
                    >
                      <Checkbox
                        id={`key-${option}`}
                        checked={missingKeys.includes(option)}
                        onCheckedChange={(checked) => handleMissingKeyChange(option, !!checked)}
                      />
                      {option}
                    </Label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePreviousStep} disabled={step === 0 || isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button onClick={handleNextStep} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
              </>
            ) : isLastStep ? (
              'Finish'
            ) : (
              <>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
