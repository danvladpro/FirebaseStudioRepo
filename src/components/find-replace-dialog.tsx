'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FindReplaceDialogState } from '@/lib/types';

type HighlightableButton = 'findNext' | 'replace' | 'replaceAll' | 'close';

interface FindReplaceDialogProps {
  state: FindReplaceDialogState | null | undefined;
  isSuccess?: boolean;
}

export function FindReplaceDialog({ state, isSuccess = false }: FindReplaceDialogProps) {
  if (!state || !state.isVisible) {
    return null;
  }

  const getButtonClass = (buttonName: HighlightableButton) => {
    const isHighlighted = state.highlightedButton === buttonName;
    if (!isHighlighted) return '';
    
    if (isSuccess) {
      return 'bg-green-500/20 ring-2 ring-green-500';
    }
    
    return 'bg-accent/20 ring-2 ring-accent';
  };

  return (
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] bg-background shadow-2xl z-20 border">
      <CardHeader className="flex flex-row items-center justify-between p-2 pl-4 bg-muted/50 rounded-t-lg border-b cursor-move">
        <CardTitle className="text-sm font-medium">Find and Replace</CardTitle>
        <Button variant="ghost" size="icon" className={cn('h-6 w-6', getButtonClass('close'))}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={state.activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none bg-transparent p-2 border-b">
            <TabsTrigger value="find" className="data-[state=active]:bg-muted/80 data-[state=active]:shadow-none">Find</TabsTrigger>
            <TabsTrigger value="replace" className="data-[state=active]:bg-muted/80 data-[state=active]:shadow-none">Replace</TabsTrigger>
          </TabsList>
          <TabsContent value="find" className="p-4 space-y-4 mt-0">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="find-what-find">Find what:</Label>
              <Input type="text" id="find-what-find" value={state.findValue || ''} readOnly className="bg-muted/30" />
            </div>
          </TabsContent>
          <TabsContent value="replace" className="p-4 space-y-4 mt-0">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="find-what-replace">Find what:</Label>
              <Input type="text" id="find-what-replace" value={state.findValue || ''} readOnly className="bg-muted/30" />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="replace-with">Replace with:</Label>
              <Input type="text" id="replace-with" value={state.replaceValue || ''} readOnly className="bg-muted/30" />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="p-4 flex justify-end gap-2 border-t bg-muted/50 rounded-b-lg">
        {state.activeTab === 'find' ? (
          <>
            <Button variant="outline" className={cn(getButtonClass('findNext'))}>Find Next</Button>
            <Button variant="outline" className={cn(getButtonClass('close'))}>Close</Button>
          </>
        ) : (
          <>
            <Button variant="outline" className={cn(getButtonClass('findNext'))}>Find Next</Button>
            <Button variant="outline" className={cn(getButtonClass('replace'))}>Replace</Button>
            <Button variant="outline" className={cn(getButtonClass('replaceAll'))}>Replace All</Button>
            <Button variant="outline" className={cn(getButtonClass('close'))}>Close</Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
