'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from './ui/checkbox';

interface SortDialogProps {
  isVisible: boolean;
}

export function SortDialog({ isVisible }: SortDialogProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] bg-background shadow-2xl z-30 border">
      <CardHeader className="p-1.5 pl-2.5 border-b">
        <CardTitle className="text-sm font-medium">Sort</CardTitle>
      </CardHeader>
      <CardContent className="p-2.5 space-y-2">
        <div className="flex items-center justify-end space-x-2">
            <Checkbox id="has-headers" defaultChecked />
            <Label htmlFor="has-headers" className='font-normal text-xs'>My data has headers</Label>
        </div>
        <div className="border p-1.5 rounded-md space-y-1.5">
            <div className="grid grid-cols-[auto_1fr_1fr_1fr] items-center gap-1.5">
                <Label className="text-xs text-right">Sort by</Label>
                <Select>
                    <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Column A" /></SelectTrigger>
                    <SelectContent><SelectItem value="A">Column A</SelectItem></SelectContent>
                </Select>
                <Select>
                    <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Cell Values" /></SelectTrigger>
                    <SelectContent><SelectItem value="values">Cell Values</SelectItem></SelectContent>
                </Select>
                <Select>
                    <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="A to Z" /></SelectTrigger>
                    <SelectContent><SelectItem value="az">A to Z</SelectItem></SelectContent>
                </Select>
            </div>
        </div>
        <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs">Add Level</Button>
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs">Delete Level</Button>
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs">Copy Level</Button>
        </div>
      </CardContent>
      <CardFooter className="py-1.5 px-2.5 flex justify-end gap-2 border-t bg-muted/50 rounded-b-lg">
        <Button variant="outline" size="sm" className="h-6 px-2 text-xs">Options...</Button>
        <div className="flex-grow" />
        <Button variant="default" size="sm" className="h-6 px-2 text-xs">OK</Button>
        <Button variant="outline" size="sm" className="h-6 px-2 text-xs">Cancel</Button>
      </CardFooter>
    </Card>
  );
}
