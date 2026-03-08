'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';

interface FormatCellsDialogProps {
  isVisible: boolean;
}

export function FormatCellsDialog({ isVisible }: FormatCellsDialogProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] bg-background shadow-2xl z-20 border">
      <CardHeader className="flex flex-row items-center justify-between p-2 pl-4 bg-muted/50 rounded-t-lg border-b">
        <CardTitle className="text-sm font-medium">Format Cells</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="number" className="w-full">
          <TabsList className="grid w-full grid-cols-6 rounded-none bg-transparent p-2 border-b">
            <TabsTrigger value="number" className="text-xs data-[state=active]:bg-muted/80 data-[state=active]:shadow-none">Number</TabsTrigger>
            <TabsTrigger value="alignment" className="text-xs data-[state=active]:bg-muted/80 data-[state=active]:shadow-none">Alignment</TabsTrigger>
            <TabsTrigger value="font" className="text-xs data-[state=active]:bg-muted/80 data-[state=active]:shadow-none">Font</TabsTrigger>
            <TabsTrigger value="border" className="text-xs data-[state=active]:bg-muted/80 data-[state=active]:shadow-none">Border</TabsTrigger>
            <TabsTrigger value="fill" className="text-xs data-[state=active]:bg-muted/80 data-[state=active]:shadow-none">Fill</TabsTrigger>
            <TabsTrigger value="protection" className="text-xs data-[state=active]:bg-muted/80 data-[state=active]:shadow-none">Protection</TabsTrigger>
          </TabsList>
          <TabsContent value="number" className="p-4 space-y-4 mt-0 min-h-[200px]">
            <p className="text-sm text-muted-foreground">Number formatting options would be displayed here.</p>
          </TabsContent>
          <TabsContent value="alignment" className="p-4 space-y-4 mt-0 min-h-[200px]">
            <p className="text-sm text-muted-foreground">Alignment options would be displayed here.</p>
          </TabsContent>
          {/* Other tabs can be added here */}
        </Tabs>
      </CardContent>
      <CardFooter className="p-4 flex justify-end gap-2 border-t bg-muted/50 rounded-b-lg">
        <Button variant="outline" size="sm">Cancel</Button>
        <Button variant="default" size="sm">OK</Button>
      </CardFooter>
    </Card>
  );
}
