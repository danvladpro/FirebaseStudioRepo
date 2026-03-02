
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

  return (
    <Card className="absolute top-[60px] left-[100px] w-[250px] bg-background shadow-2xl z-20 border">
      <CardContent className="p-1">
        <div className="p-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search" className="pl-8 h-8" />
          </div>
        </div>
        <Separator className="my-1" />
        <div className="flex flex-col p-1">
          {defaultOptions.map((option, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center space-x-2 p-1.5 rounded-sm",
                state.filterDropdownHighlightedIndex === index && "bg-accent"
              )}
            >
              <Checkbox id={`filter-${index}`} defaultChecked />
              <Label htmlFor={`filter-${index}`} className="font-normal w-full cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </div>
        <Separator className="my-1" />
        <div className="p-1">
            <Button size="sm" className="w-full">OK</Button>
        </div>
      </CardContent>
    </Card>
  );
}
