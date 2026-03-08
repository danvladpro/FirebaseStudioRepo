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
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] bg-background shadow-2xl z-20 border">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-base font-semibold">Sort</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-end space-x-2">
            <Checkbox id="has-headers" defaultChecked />
            <Label htmlFor="has-headers" className='font-normal'>My data has headers</Label>
        </div>
        <div className="border p-2 rounded-md space-y-2">
            <div className="grid grid-cols-[auto_1fr_1fr_1fr] items-center gap-2">
                <Label className="text-sm text-right">Sort by</Label>
                <Select>
                    <SelectTrigger><SelectValue placeholder="Column A" /></SelectTrigger>
                    <SelectContent><SelectItem value="A">Column A</SelectItem></SelectContent>
                </Select>
                <Select>
                    <SelectTrigger><SelectValue placeholder="Cell Values" /></SelectTrigger>
                    <SelectContent><SelectItem value="values">Cell Values</SelectItem></SelectContent>
                </Select>
                <Select>
                    <SelectTrigger><SelectValue placeholder="A to Z" /></SelectTrigger>
                    <SelectContent><SelectItem value="az">A to Z</SelectItem></SelectContent>
                </Select>
            </div>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm">Add Level</Button>
            <Button variant="outline" size="sm">Delete Level</Button>
            <Button variant="outline" size="sm">Copy Level</Button>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-end gap-2 border-t bg-muted/50 rounded-b-lg">
        <Button variant="outline" size="sm">Options...</Button>
        <div className="flex-grow" />
        <Button variant="default" size="sm">OK</Button>
        <Button variant="outline" size="sm">Cancel</Button>
      </CardFooter>
    </Card>
  );
}
