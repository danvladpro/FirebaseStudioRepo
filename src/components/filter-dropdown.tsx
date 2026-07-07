
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { FindReplaceDialogState } from '@/lib/types';

interface FilterDropdownProps {
  state: Partial<FindReplaceDialogState>;
}

const defaultOptions = [
  "(Select All)",
  "Project A",
  "Project B",
  "Project C",
  "Project D",
];

export function FilterDropdown({ state }: FilterDropdownProps) {
  if (!state.filterDropdownVisible) {
    return null;
  }

  const checkedState = state.filterDropdownCheckedState || [true, true, true, true, true];

  return (
    <Card className="absolute top-[44px] left-[100px] w-[200px] bg-background shadow-2xl z-20 border">
      <CardContent className="p-1">
        <div className="p-0.5">
          <div className="relative">
            <Search className="absolute left-2 top-1.5 h-3 w-3 text-muted-foreground" />
            <Input placeholder="Search" className="pl-7 h-6 text-xs" />
          </div>
        </div>
        <Separator className="my-0.5" />
        <div className="flex flex-col p-0.5">
          {defaultOptions.map((option, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center space-x-2 px-1.5 py-0.5 rounded-sm",
                state.filterDropdownHighlightedIndex === index && "bg-accent"
              )}
            >
              <Checkbox id={`filter-${index}`} checked={checkedState[index]} className="h-3.5 w-3.5" />
              <Label htmlFor={`filter-${index}`} className="font-normal text-xs w-full cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </div>
        <Separator className="my-0.5" />
        <div className="p-0.5">
            <Button size="sm" className="w-full h-6 text-xs">OK</Button>
        </div>
      </CardContent>
    </Card>
  );
}
