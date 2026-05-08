'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { FindReplaceDialogState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface FormatCellsDialogProps {
  state: Partial<FindReplaceDialogState>;
}

const categories = [
  "General",
  "Number",
  "Currency",
  "Accounting",
  "Date",
];

export function FormatCellsDialog({ state }: FormatCellsDialogProps) {
  if (!state.formatCellsDialogVisible) {
    return null;
  }

  const activeCategory = state.formatCellsDialogActiveCategory || "General";
  const highlightedCategoryIndex = state.formatCellsDialogHighlightedCategoryIndex ?? 0;

  return (
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-background shadow-2xl z-30 border">
      <CardHeader className="flex flex-row items-center justify-between p-1.5 pl-2.5 bg-muted/50 rounded-t-lg border-b">
        <CardTitle className="text-sm font-medium">Format Cells</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-2.5">
        <div className="flex gap-3">
            <div className="w-1/3 border rounded-md p-1">
                <Label className="px-1.5 text-xs text-muted-foreground">Category:</Label>
                <div className="flex flex-col gap-0.5 mt-0.5">
                    {categories.map((category, index) => (
                        <div key={category} className={cn(
                            "px-1.5 py-0.5 text-xs rounded-sm cursor-default",
                            highlightedCategoryIndex === index && "bg-primary text-primary-foreground",
                            activeCategory === category && highlightedCategoryIndex !== index && "bg-muted"
                        )}>
                            {category}
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-2/3">
                {activeCategory === 'General' && (
                    <div>
                        <p className="text-xs">General format cells have no specific number format.</p>
                    </div>
                )}
                {activeCategory === 'Number' && (
                    <div className="space-y-2">
                        <div className="grid w-full max-w-sm items-center gap-1">
                            <Label htmlFor="decimal-places" className="text-xs">Decimal places:</Label>
                            <Input type="number" id="decimal-places" defaultValue="2" className="h-7 text-xs" />
                        </div>
                        <p className="text-xs text-muted-foreground">Number is used for general display of numbers. Currency and Accounting offer specialized formatting for monetary values.</p>
                    </div>
                )}
                {activeCategory === 'Currency' && (
                    <div className="space-y-2">
                        <div className="grid w-full max-w-sm items-center gap-1">
                            <Label htmlFor="decimal-places-curr" className="text-xs">Decimal places:</Label>
                            <Input type="number" id="decimal-places-curr" defaultValue="2" className="h-7 text-xs" />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1">
                            <Label htmlFor="symbol" className="text-xs">Symbol:</Label>
                            <Input type="text" id="symbol" defaultValue="$" className="h-7 text-xs" />
                        </div>
                    </div>
                )}
                {activeCategory === 'Accounting' && (
                    <div className="space-y-2">
                        <div className="grid w-full max-w-sm items-center gap-1">
                            <Label htmlFor="decimal-places-acc" className="text-xs">Decimal places:</Label>
                            <Input type="number" id="decimal-places-acc" defaultValue="2" className="h-7 text-xs" />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1">
                            <Label htmlFor="symbol-acc" className="text-xs">Symbol:</Label>
                            <Input type="text" id="symbol-acc" defaultValue="$" className="h-7 text-xs" />
                        </div>
                    </div>
                )}
                {activeCategory === 'Date' && (
                    <div className="space-y-1.5">
                        <Label className="text-xs">Type:</Label>
                        <div className="border rounded-md p-1 h-28 overflow-y-auto">
                            <div className="p-1.5 bg-muted rounded-sm text-xs">*3/14/2012</div>
                            <div className="p-1.5 text-xs">*Wednesday, March 14, 2012</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
      <CardFooter className="py-1.5 px-2.5 flex justify-end gap-2 border-t bg-muted/50 rounded-b-lg">
        <Button variant="outline" size="sm" className="h-6 px-2 text-xs">Cancel</Button>
        <Button variant="default" size="sm" className="h-6 px-2 text-xs">OK</Button>
      </CardFooter>
    </Card>
  );
}