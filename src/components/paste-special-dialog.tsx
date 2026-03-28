
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { FindReplaceDialogState } from '@/lib/types';
import { X } from 'lucide-react';

interface PasteSpecialDialogProps {
  state: Partial<FindReplaceDialogState>;
}

const pasteOptions = ['All', 'Formulas', 'Values', 'Formats', 'Comments', 'Validation'];
const operationOptions = ['None', 'Add', 'Subtract', 'Multiply', 'Divide'];

export function PasteSpecialDialog({ state }: PasteSpecialDialogProps) {
  if (!state.pasteSpecialDialogVisible) {
    return null;
  }

  const activeOption = state.pasteSpecialDialogHighlightedOption || 'All';

  return (
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] bg-background shadow-2xl z-20 border">
      <CardHeader className="flex flex-row items-center justify-between p-2 pl-4 border-b">
        <CardTitle className="text-base font-semibold">Paste Special</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6">
            <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex gap-4">
        <div className="flex-1">
            <h4 className="font-semibold text-sm mb-2">Paste</h4>
            <RadioGroup value={activeOption} className="space-y-1">
            {pasteOptions.map(option => (
                <div key={option} className={cn("flex items-center space-x-2 p-1 rounded-sm", activeOption === option && "bg-accent text-accent-foreground")}>
                    <RadioGroupItem value={option} id={`paste-${option}`} />
                    <Label htmlFor={`paste-${option}`} className="font-normal flex-1 cursor-pointer">
                        <span className="underline">{option.charAt(0)}</span>{option.substring(1)}
                    </Label>
                </div>
            ))}
            </RadioGroup>
        </div>
        <Separator orientation="vertical" className="h-auto" />
        <div className="flex-1 space-y-4">
            <div>
                <h4 className="font-semibold text-sm mb-2">Operation</h4>
                 <RadioGroup defaultValue="None" className="space-y-1">
                    {operationOptions.map(option => (
                        <div key={option} className="flex items-center space-x-2 p-1">
                            <RadioGroupItem value={option} id={`op-${option}`} />
                            <Label htmlFor={`op-${option}`} className="font-normal flex-1 cursor-pointer">
                                <span className="underline">{option.charAt(0)}</span>{option.substring(1)}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
             <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2">
                    <Checkbox id="skip-blanks" />
                    <Label htmlFor="skip-blanks" className="font-normal">Skip <span className="underline">b</span>lanks</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="transpose" />
                    <Label htmlFor="transpose" className="font-normal">Transpos<span className="underline">e</span></Label>
                </div>
            </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-end gap-2 border-t bg-muted/50 rounded-b-lg">
        <Button variant="default" size="sm">OK</Button>
        <Button variant="outline" size="sm">Cancel</Button>
      </CardFooter>
    </Card>
  );
}
