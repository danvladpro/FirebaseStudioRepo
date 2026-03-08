'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FindReplaceDialogState } from '@/lib/types';

interface FillColorDropdownProps {
  state: Partial<FindReplaceDialogState>;
}

// A simplified palette
const standardColors = [
  '#c00000', // Dark Red
  '#ff0000', // Red
  '#ffc000', // Orange
  '#ffff00', // Yellow
  '#92d050', // Light Green
  '#00b050', // Green
  '#00b0f0', // Light Blue
  '#0070c0', // Blue
  '#002060', // Dark Blue
  '#7030a0', // Purple
];

export function FillColorDropdown({ state }: FillColorDropdownProps) {
  if (!state.fillColorDropdownVisible) {
    return null;
  }

  const highlightedColor = state.fillColorDropdownHighlightedColor;

  return (
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] bg-background shadow-2xl z-20 border">
      <CardContent className="p-2">
        <div className="text-xs text-muted-foreground px-1 pb-1">Standard Colors</div>
        <div className="grid grid-cols-10 gap-1">
           {standardColors.map((color) => (
            <div
              key={color}
              className={cn(
                'w-full aspect-square rounded-sm border cursor-default',
                 highlightedColor === color && 'ring-2 ring-ring ring-offset-2 ring-offset-background'
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
         <div className="text-xs text-muted-foreground px-1 pt-2 pb-1">No Fill</div>
         <div
            className={cn(
                'w-full h-7 rounded-sm border cursor-default bg-background flex items-center justify-center text-sm',
                 highlightedColor === 'transparent' && 'ring-2 ring-ring ring-offset-2 ring-offset-background'
              )}
        >
              No Fill
         </div>
      </CardContent>
    </Card>
  );
}
