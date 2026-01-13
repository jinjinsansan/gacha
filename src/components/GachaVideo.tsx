"use client";

import { useEffect, useRef } from "react";

type GachaVideoProps = {
  src: string;
  poster?: string;
  className?: string;
  onEnded?: () => void;
};

export function GachaVideo({ src, poster, className, onEnded }: GachaVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch((error) => {
        console.warn("Autoplay blocked, showing controls", error);
        video.controls = true;
      });
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      key={src}
      className={className ?? "h-full w-full object-cover"}
      src={src}
      poster={poster}
      autoPlay
      playsInline
      controls={false}
      muted
      onEnded={onEnded}
    />
  );
}
