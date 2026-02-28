'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface CreateTableDialogProps {
  isVisible: boolean;
  range: string;
  isHighlighted: boolean;
}

export function CreateTableDialog({ isVisible, range, isHighlighted }: CreateTableDialogProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] bg-background shadow-2xl z-20 border">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-base font-semibold">Create Table</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="table-range">Where is the data for your table?</Label>
          <Input type="text" id="table-range" value={range} readOnly className="bg-muted/30" />
        </div>
        <div className="flex items-center space-x-2">
            <Checkbox id="has-headers" defaultChecked />
            <Label htmlFor="has-headers" className='font-normal'>My table has headers</Label>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-end gap-2 border-t bg-muted/50 rounded-b-lg">
        <Button variant="outline" size="sm">Cancel</Button>
        <Button variant="default" size="sm" className={cn(isHighlighted && 'ring-2 ring-accent')}>
            OK
        </Button>
      </CardFooter>
    </Card>
  );
}
