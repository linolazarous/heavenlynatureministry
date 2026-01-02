import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, Circle, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CarouselContext = React.createContext(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

const Carousel = React.forwardRef(({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  autoPlay = false,
  autoPlayInterval = 4000,
  loop = true,
  showControls = true,
  showDots = true,
  showArrows = true,
  ...props
}, ref) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop,
    align: "start",
    skipSnaps: false,
    duration: 30,
    ...opts,
    axis: orientation === "horizontal" ? "x" : "y",
  }, plugins);

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState([]);
  const [isPlaying, setIsPlaying] = React.useState(autoPlay);

  const autoPlayTimerRef = React.useRef(null);

  const startAutoPlay = React.useCallback(() => {
    if (!autoPlay || !emblaApi) return;

    clearInterval(autoPlayTimerRef.current);
    autoPlayTimerRef.current = setInterval(() => {
      emblaApi.scrollNext();
    }, autoPlayInterval);
  }, [autoPlay, autoPlayInterval, emblaApi]);

  const stopAutoPlay = React.useCallback(() => {
    clearInterval(autoPlayTimerRef.current);
    autoPlayTimerRef.current = null;
  }, []);

  const toggleAutoPlay = React.useCallback(() => {
    if (isPlaying) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, startAutoPlay, stopAutoPlay]);

  const onSelect = React.useCallback((emblaApi) => {
    if (!emblaApi) return;

    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = React.useCallback((index) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  const handleKeyDown = React.useCallback((event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollNext();
    }
  }, [scrollPrev, scrollNext]);

  // Initialize carousel
  React.useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    setScrollSnaps(emblaApi.scrollSnapList());

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    if (autoPlay) {
      startAutoPlay();
    }

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      stopAutoPlay();
    };
  }, [emblaApi, onSelect, autoPlay, startAutoPlay, stopAutoPlay]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopAutoPlay();
    };
  }, [stopAutoPlay]);

  const contextValue = React.useMemo(() => ({
    carouselRef: emblaRef,
    api: emblaApi,
    opts,
    orientation,
    scrollPrev,
    scrollNext,
    scrollTo,
    canScrollPrev,
    canScrollNext,
    selectedIndex,
    scrollSnaps,
    autoPlay,
    isPlaying,
    toggleAutoPlay,
  }), [
    emblaRef, emblaApi, opts, orientation, scrollPrev, scrollNext, scrollTo,
    canScrollPrev, canScrollNext, selectedIndex, scrollSnaps, autoPlay, isPlaying, toggleAutoPlay
  ]);

  return (
    <CarouselContext.Provider value={contextValue}>
      <div
        ref={ref}
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        aria-label="Image carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
});
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div ref={carouselRef} className="overflow-hidden" aria-live="polite">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef(({ className, index, ...props }, ref) => {
  const { orientation } = useCarousel();

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${props["data-length"] || "unknown"}`}
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        "select-none",
        className
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef(({
  className,
  variant = "outline",
  size = "icon",
  hideOnMobile = false,
  ...props
}, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute z-10 h-8 w-8 rounded-full",
        "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
        "hover:bg-white dark:hover:bg-gray-800",
        "shadow-lg",
        hideOnMobile && "hidden sm:flex",
        orientation === "horizontal"
          ? "-left-3 top-1/2 -translate-y-1/2"
          : "-top-3 left-1/2 -translate-x-1/2 rotate-90",
        !canScrollPrev && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      aria-label="Previous slide"
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef(({
  className,
  variant = "outline",
  size = "icon",
  hideOnMobile = false,
  ...props
}, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute z-10 h-8 w-8 rounded-full",
        "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
        "hover:bg-white dark:hover:bg-gray-800",
        "shadow-lg",
        hideOnMobile && "hidden sm:flex",
        orientation === "horizontal"
          ? "-right-3 top-1/2 -translate-y-1/2"
          : "-bottom-3 left-1/2 -translate-x-1/2 rotate-90",
        !canScrollNext && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      aria-label="Next slide"
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
});
CarouselNext.displayName = "CarouselNext";

const CarouselDots = React.forwardRef(({ className, ...props }, ref) => {
  const { scrollSnaps, scrollTo, selectedIndex } = useCarousel();

  if (scrollSnaps.length <= 1) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute bottom-4 left-1/2 -translate-x-1/2",
        "flex gap-2 z-10",
        className
      )}
      role="tablist"
      aria-label="Carousel navigation dots"
      {...props}
    >
      {scrollSnaps.map((_, index) => (
        <Button
          key={index}
          variant="ghost"
          size="icon-sm"
          className={cn(
            "h-2 w-2 p-0 rounded-full",
            "bg-gray-300 dark:bg-gray-600",
            "hover:bg-gray-400 dark:hover:bg-gray-500",
            selectedIndex === index && "bg-blue-600 dark:bg-blue-500",
            "transition-all duration-200"
          )}
          onClick={() => scrollTo(index)}
          aria-label={`Go to slide ${index + 1}`}
          aria-selected={selectedIndex === index}
          role="tab"
        >
          <span className="sr-only">Slide {index + 1}</span>
        </Button>
      ))}
    </div>
  );
});
CarouselDots.displayName = "CarouselDots";

const CarouselPlayPause = React.forwardRef(({ className, ...props }, ref) => {
  const { isPlaying, toggleAutoPlay } = useCarousel();

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon-sm"
      className={cn(
        "absolute right-4 bottom-4 z-10",
        "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
        "hover:bg-white dark:hover:bg-gray-800",
        className
      )}
      onClick={toggleAutoPlay}
      aria-label={isPlaying ? "Pause carousel" : "Play carousel"}
      {...props}
    >
      {isPlaying ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
    </Button>
  );
});
CarouselPlayPause.displayName = "CarouselPlayPause";

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  CarouselPlayPause,
  useCarousel,
};
