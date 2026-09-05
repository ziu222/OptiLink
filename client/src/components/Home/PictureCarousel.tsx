import { useEffect, useState } from 'react';

interface Slide {
  src: string;
  alt: string;
}

interface PictureCarouselProps {
  className?: string;
  slides: Slide[];
  intervalMs?: number;
}

// Same picture-frame box as PictureFrame, but auto-advances through several
// images on a timer instead of showing just one.
export function PictureCarousel({ className = '', slides, intervalMs = 3000 }: PictureCarouselProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [slides.length, intervalMs, paused]);

  return (
    <div
      className={`picture-frame picture-carousel ${className}`.trim()}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, index) => (
        <img
          key={slide.src}
          className={`picture-carousel__image${index === active ? ' is-active' : ''}`}
          src={slide.src}
          alt={slide.alt}
        />
      ))}
      <div className="picture-carousel__dots">
        {slides.map((slide, index) => (
          <span key={slide.src} className={`picture-carousel__dot${index === active ? ' is-active' : ''}`} />
        ))}
      </div>
    </div>
  );
}
