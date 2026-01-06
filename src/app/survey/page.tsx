
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
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const surveySteps = [
  {
    id: 'name',
    title: 'Your Name',
    description: 'What should we call you?',
    type: 'input',
  },
  {
    id: 'excelLevel',
    title: 'Excel Proficiency',
    description: 'How would you rate your Excel skills?',
    options: ['Never used', 'Beginner', 'Intermediate', 'Advanced'],
    type: 'radio',
  },
  {
    id: 'seniority',
    title: 'Seniority Level',
    description: 'What is your current career level?',
    options: ['Intern', 'Junior', 'Associate', 'Senior', 'Manager', 'Director', 'C-Level'],
    type: 'radio',
  },
  {
    id: 'field',
    title: 'Your Field',
    description: 'What field do you primarily work in?',
    options: ['Finance', 'Marketing', 'Analytics', 'Sales', 'Research', 'Business', 'Other'],
    type: 'radio',
  },
  {
    id: 'missingKeys',
    title: 'Keyboard Configuration',
    description: 'Select any keys that are NOT on your keyboard. This will help us tailor challenges for you.',
    options: ['Home', 'End', 'PageUp', 'PageDown', 'Insert', 'F-Keys (F1-F12)'],
    type: 'checkbox',
  },
];

export default function SurveyPage() {
  const [step, setStep] = useState(0);
  const [surveyData, setSurveyData] = useState<Record<string, string | string[]>>({});
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
      
      const getCountry = async () => {
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
    const currentStepInfo = surveySteps[step];
    if (currentStepInfo.type !== 'checkbox' && !surveyData[currentStepInfo.id]) {
      toast({
        title: "Please provide an answer",
        description: "You must provide an answer to continue.",
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

  const handleValueChange = (id: string, value: string | string[]) => {
    setSurveyData(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id: string, option: string, checked: boolean) => {
    const currentSelection = (surveyData[id] as string[] | undefined) || [];
    const newSelection = checked
      ? [...currentSelection, option]
      : currentSelection.filter(item => item !== option);
    handleValueChange(id, newSelection);
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
      const { name, ...restOfSurveyData } = surveyData;
      await updateDoc(userDocRef, {
        name: name as string,
        survey: restOfSurveyData,
        missingKeys: surveyData.missingKeys || [],
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
          {currentStep.type === 'radio' && currentStep.options && (
            <RadioGroup
              value={surveyData[currentStep.id] as string}
              onValueChange={(value) => handleValueChange(currentStep.id, value)}
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
          )}
          {currentStep.type === 'input' && (
            <div className="space-y-2">
              <Label htmlFor={currentStep.id}>Name</Label>
              <Input
                id={currentStep.id}
                type="text"
                placeholder="e.g. Jane Doe"
                value={surveyData[currentStep.id] as string || ''}
                onChange={(e) => handleValueChange(currentStep.id, e.target.value)}
              />
            </div>
          )}
          {currentStep.type === 'checkbox' && currentStep.options && (
            <div className="space-y-2">
              {currentStep.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={(surveyData[currentStep.id] as string[] | undefined)?.includes(option)}
                    onCheckedChange={(checked) => handleCheckboxChange(currentStep.id, option, !!checked)}
                  />
                  <Label htmlFor={option} className="flex-1 cursor-pointer p-3 rounded-md hover:bg-muted/50">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}
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
