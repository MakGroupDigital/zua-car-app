'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  onRate?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

export function Rating({
  value,
  max = 5,
  size = 'md',
  readonly = false,
  onRate,
  showValue = false,
  className,
}: RatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const handleClick = async (rating: number) => {
    if (readonly || !onRate || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onRate(rating);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayValue = hoveredRating !== null ? hoveredRating : value;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {[...Array(max)].map((_, index) => {
          const rating = index + 1;
          const isFilled = rating <= Math.floor(displayValue);
          const isHalfFilled = !isFilled && rating - 0.5 <= displayValue && displayValue < rating;
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(rating)}
              onMouseEnter={() => !readonly && setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(null)}
              disabled={readonly || isSubmitting}
              className={cn(
                'transition-all duration-200',
                !readonly && 'cursor-pointer hover:scale-110',
                readonly && 'cursor-default',
                isSubmitting && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled
                    ? 'fill-primary text-primary'
                    : isHalfFilled
                    ? 'fill-primary/50 text-primary/50'
                    : 'fill-none text-muted-foreground'
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-muted-foreground ml-1">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}


