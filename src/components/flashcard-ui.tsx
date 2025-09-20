
"use client";

import * as React from "react";
import Image from "next/image";
import { Challenge } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface FlashcardUIProps {
  challenges: Challenge[];
  title: string;
}

const KeyDisplay = ({ value }: { value: string }) => {
    const isModifier = ["Control", "Shift", "Alt", "Meta"].includes(value);
    const isLetter = value.length === 1 && value.match(/[a-z]/i);

    return (
        <kbd className={cn(
            "px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted rounded-md border-b-2",
            isModifier ? "min-w-[4rem] text-center" : "",
            isLetter ? "uppercase" : ""
        )}>
            {value === " " ? "Space" : value}
        </kbd>
    );
};

interface FlashcardProps {
  challenge: Challenge;
}

function Flashcard({ challenge }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = React.useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };
  
  // Reset flip state when challenge changes
  React.useEffect(() => {
    setIsFlipped(false);
  }, [challenge]);

  return (
    <div
      className="flashcard-container w-full h-full cursor-pointer"
      onClick={handleCardClick}
      style={{ perspective: "1000px" }}
    >
      <Card
        className={cn("flashcard w-full h-full transition-transform duration-500", isFlipped ? 'is-flipped' : '')}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of the card */}
        <div className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center text-center p-6">
          <p className="text-xl md:text-2xl font-semibold text-foreground mb-6">{challenge.description}</p>
          <div className="flex justify-center items-center h-24 bg-muted rounded-lg mb-6 overflow-hidden px-4">
            <Image
              src={challenge.imageUrl}
              alt={challenge.description}
              width={200}
              height={80}
              className="object-contain"
              data-ai-hint={challenge.imageHint}
            />
          </div>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Click card to reveal shortcut
          </p>
        </div>
        {/* Back of the card */}
        <div className="absolute w-full h-full backface-hidden [transform:rotateY(180deg)] flex flex-col items-center justify-center text-center p-6 bg-secondary">
          <p className="text-xl md:text-2xl font-semibold text-secondary-foreground mb-6">Shortcut:</p>
          <div className="flex items-center justify-center gap-2">
            {challenge.keys.map(key => <KeyDisplay key={key} value={key} />)}
          </div>
        </div>
      </Card>
    </div>
  );
}


export function FlashcardUI({ challenges, title }: FlashcardUIProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    const onSelect = (api: CarouselApi) => {
      setCurrent(api.selectedScrollSnap() + 1);
    };

    api.on("select", onSelect);
    
    return () => {
      api.off("select", onSelect)
    }
  }, [api]);
  
  React.useEffect(() => {
    api?.scrollTo(0);
  }, [challenges, api]);

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
        <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
            {challenges.map((challenge, index) => (
                <CarouselItem key={`${title}-${index}`}>
                    <div className="p-1 h-[420px]">
                      <Flashcard challenge={challenge} />
                    </div>
                </CarouselItem>
            ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2" />
        </Carousel>
        <div className="py-2 text-center text-sm text-muted-foreground">
            Card {current} of {count}
        </div>
        <style jsx>{`
            .flashcard.is-flipped {
                transform: rotateY(180deg);
            }
            .backface-hidden {
                -webkit-backface-visibility: hidden;
                backface-visibility: hidden;
            }
        `}</style>
    </div>
  );
}
