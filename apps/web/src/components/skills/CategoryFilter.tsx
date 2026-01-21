import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onChange: (category: string | null) => void;
  className?: string;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onChange,
  className,
}: CategoryFilterProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Button
        variant={selectedCategory === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange(null)}
        className="rounded-full"
      >
        All
      </Button>
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(category)}
          className="rounded-full capitalize"
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
