"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    quote: string;
    name: string;
    title: string;
    image?: string;
    price?: string;
    category?: string;
    rating?: string;
    specs?: string[];
    ctaHref?: string;
    ctaLabel?: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  const getDirection = useCallback(() => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "normal",
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse",
        );
      }
    }
  }, [direction]);

  const getSpeed = useCallback(() => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  }, [speed]);

  const addAnimation = useCallback(() => {
    if (containerRef.current && scrollerRef.current) {
      const existingChildren = Array.from(scrollerRef.current.children);
      existingChildren.forEach((child) => {
        if ((child as HTMLElement).dataset.cloned === "true") {
          child.remove();
        }
      });

      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true) as HTMLElement;
        duplicatedItem.dataset.cloned = "true";
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(scrollerContent.length > 0);
    }
  }, [getDirection, getSpeed]);

  useEffect(() => {
    addAnimation();
  }, [addAnimation]);
  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {items.map((item, idx) => (
          <li
            className="relative h-[430px] w-[340px] max-w-full shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-[linear-gradient(180deg,#0b1220,#060b14)] p-0 md:w-[360px]"
            key={`${item.name}-${idx}`}
          >
            {item.image ? (
              <div className="relative flex h-full flex-col">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover object-center"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/50 px-2 py-1 text-[10px] uppercase tracking-wider text-white">
                    {item.category || "Premium"}
                  </div>
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/20 bg-black/50 px-2 py-1 text-xs text-white">
                    <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                    {item.rating || "4.8"}
                  </div>
                </div>

                <div className="flex h-[calc(100%-12rem)] flex-col p-4">
                  <h3 className="line-clamp-1 text-lg font-bold text-white">{item.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-300">{item.title}</p>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {(item.specs || []).slice(0, 3).map((spec, specIndex) => (
                      <div key={specIndex} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-center text-xs text-gray-200">
                        {spec}
                      </div>
                    ))}
                  </div>

                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-gray-400">{item.quote}</p>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    <div>
                      <div className="text-xl font-bold text-orange-300">{item.price || "-"}</div>
                      <div className="text-xs text-gray-400">/ gün</div>
                    </div>
                    {item.ctaHref ? (
                      <Link href={item.ctaHref}>
                        <Button className="h-9 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 text-sm text-white hover:from-orange-600 hover:to-red-600">
                          {item.ctaLabel || "Rezerve Et"}
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <blockquote className="p-6">
                <span className="relative z-20 text-sm leading-[1.6] font-normal text-gray-100">
                  {item.quote}
                </span>
                <div className="relative z-20 mt-6 flex flex-row items-center">
                  <span className="flex flex-col gap-1">
                    <span className="text-sm leading-[1.6] font-normal text-gray-300">
                      {item.name}
                    </span>
                    <span className="text-sm leading-[1.6] font-normal text-gray-400">
                      {item.title}
                    </span>
                  </span>
                </div>
              </blockquote>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
