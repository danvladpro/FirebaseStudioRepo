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
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] bg-background shadow-2xl z-20 border">
      <CardHeader className="flex flex-row items-center justify-between p-2 pl-4 bg-muted/50 rounded-t-lg border-b">
        <CardTitle className="text-sm font-medium">Format Cells</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex gap-4">
            {/* Category List */}
            <div className="w-1/3 border rounded-md p-1">
                <Label className="px-2 text-xs text-muted-foreground">Category:</Label>
                <div className="flex flex-col gap-0.5 mt-1">
                    {categories.map((category, index) => (
                        <div key={category} className={cn(
                            "px-2 py-1 text-sm rounded-sm cursor-default",
                            highlightedCategoryIndex === index && "bg-primary text-primary-foreground",
                            activeCategory === category && highlightedCategoryIndex !== index && "bg-muted"
                        )}>
                            {category}
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="w-2/3">
                {activeCategory === 'General' && (
                    <div>
                        <p className="text-sm">General format cells have no specific number format.</p>
                    </div>
                )}
                 {activeCategory === 'Number' && (
                    <div className="space-y-4">
                         <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="decimal-places">Decimal places:</Label>
                            <Input type="number" id="decimal-places" defaultValue="2" />
                        </div>
                         <p className="text-sm text-muted-foreground">Number is used for general display of numbers. Currency and Accounting offer specialized formatting for monetary values.</p>
                    </div>
                )}
                 {activeCategory === 'Currency' && (
                    <div className="space-y-4">
                         <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="decimal-places-curr">Decimal places:</Label>
                            <Input type="number" id="decimal-places-curr" defaultValue="2" />
                        </div>
                         <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="symbol">Symbol:</Label>
                            <Input type="text" id="symbol" defaultValue="$" />
                        </div>
                    </div>
                )}
                 {activeCategory === 'Accounting' && (
                    <div className="space-y-4">
                         <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="decimal-places-acc">Decimal places:</Label>
                            <Input type="number" id="decimal-places-acc" defaultValue="2" />
                        </div>
                         <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="symbol-acc">Symbol:</Label>
                            <Input type="text" id="symbol-acc" defaultValue="$" />
                        </div>
                    </div>
                )}
                 {activeCategory === 'Date' && (
                    <div className="space-y-2">
                        <Label>Type:</Label>
                        <div className="border rounded-md p-1 h-32 overflow-y-auto">
                            <div className="p-2 bg-muted rounded-sm">*3/14/2012</div>
                            <div className="p-2">*Wednesday, March 14, 2012</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-end gap-2 border-t bg-muted/50 rounded-b-lg">
        <Button variant="outline" size="sm">Cancel</Button>
        <Button variant="default" size="sm">OK</Button>
      </CardFooter>
    </Card>
  );
}