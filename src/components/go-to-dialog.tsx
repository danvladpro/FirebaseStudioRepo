'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface GoToDialogProps {
  isVisible: boolean;
  reference: string;
  isOkHighlighted: boolean;
  isInputHighlighted: boolean;
}

export function GoToDialog({ isVisible, reference, isOkHighlighted, isInputHighlighted }: GoToDialogProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] bg-background shadow-2xl z-20 border">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <CardTitle className="text-base font-semibold">Go To</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6">
            <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="goto-reference">Reference:</Label>
          <Input 
            type="text" 
            id="goto-reference" 
            value={reference} 
            readOnly 
            className={cn(isInputHighlighted && 'ring-2 ring-accent', 'bg-muted/30')} 
          />
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t bg-muted/50 rounded-b-lg">
        <Button variant="outline" size="sm">Special...</Button>
        <div className="flex gap-2">
            <Button variant="default" size="sm" className={cn(isOkHighlighted && 'ring-2 ring-accent')}>
                OK
            </Button>
            <Button variant="outline" size="sm">Cancel</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
