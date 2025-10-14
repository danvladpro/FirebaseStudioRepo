
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
import { ArrowLeft } from 'lucide-react';

const surveySteps = [
  {
    id: 'excelLevel',
    title: 'Excel Proficiency',
    description: 'How would you rate your Excel skills?',
    options: ['Never used', 'Beginner', 'Intermediate', 'Advanced'],
  },
  {
    id: 'seniority',
    title: 'Seniority Level',
    description: 'What is your current career level?',
    options: ['Intern', 'Junior', 'Associate', 'Senior', 'Manager', 'Director', 'C-Level'],
  },
  {
    id: 'field',
    title: 'Your Field',
    description: 'What field do you primarily work in?',
    options: ['Finance', 'Marketing', 'Analytics', 'Sales', 'Research', 'Business', 'Other'],
  },
];

export default function SurveyPage() {
  const [step, setStep] = useState(0);
  const [surveyData, setSurveyData] = useState<Record<string, string>>({});
  const [analyticsData, setAnalyticsData] = useState<Record<string, string | undefined>>({});
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
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
      
      // Placeholder for country detection
      const getCountry = async () => {
          // In a real app, you would use a service like ip-api.com or geo.ipify.org
          // For this example, we'll just use a placeholder.
          return "Not Detected";
      };
      
      getCountry().then(country => {
          setAnalyticsData({
              os: getOS(),
              browser: getBrowser(),
              country,
          });
      });
    }
  }, []);

  const handleNextStep = () => {
    if (!surveyData[surveySteps[step].id]) {
      toast({
        title: "Please make a selection",
        description: "You must select an option to continue.",
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

  const handleValueChange = (value: string) => {
    setSurveyData(prev => ({ ...prev, [surveySteps[step].id]: value }));
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
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        survey: surveyData,
        analytics: analyticsData
      });
      router.push('/dashboard');
    } catch (error: any) {
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
  const progress = ((step + 1) / surveySteps.length) * 100;

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <Progress value={progress} className="mb-4" />
          <CardTitle>{currentStep.title}</CardTitle>
          <CardDescription>{currentStep.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={surveyData[currentStep.id]}
            onValueChange={handleValueChange}
            className="space-y-2"
          >
            {currentStep.options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className="flex-1 cursor-pointer p-3 rounded-md hover:bg-muted/50">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePreviousStep} disabled={step === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button onClick={handleNextStep}>
            {step === surveySteps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
