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
  const selectedOption = state.pasteSpecialDialogSelectedOption || 'All';

  return (
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-background shadow-2xl z-30 border">
      <CardHeader className="flex flex-row items-center justify-between p-1.5 pl-2.5 border-b">
        <CardTitle className="text-sm font-medium">Paste Special</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6">
            <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-1.5 flex gap-2">
        <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-0.5">Paste</h4>
            <RadioGroup value={selectedOption} className="space-y-0">
            {pasteOptions.map(option => (
                <div key={option} className={cn("flex items-center space-x-1.5 py-px rounded-sm", activeOption === option && "bg-accent text-accent-foreground")}>
                    <RadioGroupItem value={option} id={`paste-${option}`} className="h-3 w-3" />
                    <Label htmlFor={`paste-${option}`} className="font-normal flex-1 cursor-pointer text-xs leading-tight">
                        <span className="underline">{option.charAt(0)}</span>{option.substring(1)}
                    </Label>
                </div>
            ))}
            </RadioGroup>
        </div>
        <Separator orientation="vertical" className="h-auto" />
        <div className="flex-1 space-y-0.5">
            <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-0.5">Operation</h4>
                <RadioGroup defaultValue="None" className="space-y-0">
                    {operationOptions.map(option => (
                        <div key={option} className="flex items-center space-x-1.5 py-px">
                            <RadioGroupItem value={option} id={`op-${option}`} className="h-3 w-3" />
                            <Label htmlFor={`op-${option}`} className="font-normal flex-1 cursor-pointer text-xs leading-tight">
                                <span className="underline">{option.charAt(0)}</span>{option.substring(1)}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
            <div className="space-y-px pt-0.5">
                <div className="flex items-center space-x-1.5">
                    <Checkbox id="skip-blanks" className="h-3 w-3" />
                    <Label htmlFor="skip-blanks" className="font-normal text-xs leading-tight">Skip <span className="underline">b</span>lanks</Label>
                </div>
                <div className="flex items-center space-x-1.5">
                    <Checkbox id="transpose" className="h-3 w-3" />
                    <Label htmlFor="transpose" className="font-normal text-xs leading-tight">Transpos<span className="underline">e</span></Label>
                </div>
            </div>
        </div>
      </CardContent>
      <CardFooter className="py-1.5 px-2.5 flex justify-end gap-2 border-t bg-muted/50 rounded-b-lg">
        <Button variant="default" size="sm" className={cn('h-6 px-2 text-xs', state.highlightedButton === 'ok' && 'ring-2 ring-accent')}>OK</Button>
        <Button variant="outline" size="sm" className="h-6 px-2 text-xs">Cancel</Button>
      </CardFooter>
    </Card>
  );
}
