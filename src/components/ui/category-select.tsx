import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Category } from '@/types';

interface CategorySelectProps {
  categories: Category[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  showAllOption?: boolean;
}

export function CategorySelect({
  categories,
  value,
  onValueChange,
  placeholder = 'Chọn danh mục',
  showAllOption = false,
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [hoveredParent, setHoveredParent] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 });
  const parentItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const submenuRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);

  const getSelectedLabel = () => {
    if (!value || value === 'all') return placeholder;
    
    for (const category of categories) {
      if (category.id === value) return category.name;
      if (category.children) {
        const child = category.children.find(c => c.id === value);
        if (child) return child.name;
      }
    }
    return placeholder;
  };

  const handleSelect = (categoryId: string) => {
    console.log('=== handleSelect called ===');
    console.log('categoryId:', categoryId);
    console.log('isSelectingRef before:', isSelectingRef.current);
    
    isSelectingRef.current = true;
    onValueChange(categoryId);
    setHoveredParent(null);
    
    console.log('After onValueChange');
    
    // Close after a short delay
    setTimeout(() => {
      console.log('setTimeout callback - closing popover');
      setOpen(false);
      isSelectingRef.current = false;
    }, 100);
  };

  const handleParentHover = (categoryId: string, element: HTMLDivElement) => {
    const rect = element.getBoundingClientRect();
    setSubmenuPosition({
      top: rect.top,
      left: rect.right + 4,
    });
    setHoveredParent(categoryId);
  };

  // Handle clicks outside - but ignore clicks on submenu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSelectingRef.current) return;
      
      const target = event.target as Node;
      if (submenuRef.current && submenuRef.current.contains(target)) {
        event.stopPropagation();
        event.preventDefault();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside, true);
      };
    }
  }, [open]);

  return (
    <>
      <Popover modal={false} open={open} onOpenChange={(isOpen) => {
        console.log('=== Popover onOpenChange ===');
        console.log('isOpen:', isOpen);
        console.log('isSelectingRef:', isSelectingRef.current);
        console.log('hoveredParent:', hoveredParent);
        
        // Don't close if we're selecting or if submenu is open
        // But always allow opening
        if (isSelectingRef.current) {
          console.log('Blocked by isSelectingRef');
          return;
        }
        
        if (!isOpen && hoveredParent) {
          console.log('Blocked closing because hoveredParent exists');
          return;
        }
        
        setOpen(isOpen);
        if (!isOpen) setHoveredParent(null);
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {getSelectedLabel()}
            <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="max-h-[400px] overflow-y-auto p-1">
            {showAllOption && (
              <div
                className={cn(
                  'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors',
                  value === 'all' && 'bg-accent'
                )}
                onClick={() => handleSelect('all')}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === 'all' ? 'opacity-100' : 'opacity-0'
                  )}
                />
                Tất cả danh mục
              </div>
            )}
            {categories.map((category) => (
              <div
                key={category.id}
                ref={(el) => (parentItemRefs.current[category.id] = el)}
                className={cn(
                  'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground font-semibold transition-colors',
                  value === category.id && 'bg-accent'
                )}
                onClick={() => handleSelect(category.id)}
                onMouseEnter={(e) => {
                  if (category.children && category.children.length > 0) {
                    handleParentHover(category.id, e.currentTarget);
                  }
                }}
                onMouseLeave={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const isMovingRight = e.clientX > rect.right;
                  if (!isMovingRight) {
                    setHoveredParent(null);
                  }
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === category.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {category.name}
                {category.children && category.children.length > 0 && (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Submenu - rendered via Portal to avoid Popover interference */}
      {hoveredParent && open && createPortal(
        (() => {
          const category = categories.find(c => c.id === hoveredParent);
          if (!category?.children || category.children.length === 0) return null;
          
          console.log('=== Rendering submenu for:', category.name, 'children:', category.children.length);
          
          return (
            <div
              ref={submenuRef}
              className="fixed z-[100] w-[250px] rounded-md border bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
              style={{
                top: `${submenuPosition.top}px`,
                left: `${submenuPosition.left}px`,
              }}
              onMouseEnter={() => {
                console.log('=== Submenu mouse enter ===');
                setHoveredParent(category.id);
              }}
              onMouseLeave={() => {
                console.log('=== Submenu mouse leave ===');
                setHoveredParent(null);
              }}
              onClick={(e) => {
                console.log('=== Submenu container clicked ===');
                e.stopPropagation();
              }}
            >
              {category.children.map((child) => (
                <div
                  key={child.id}
                  className={cn(
                    'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors pl-6',
                    value === child.id && 'bg-accent'
                  )}
                  onClick={(e) => {
                    console.log('=== Child category clicked (onClick) ===');
                    console.log('child.id:', child.id);
                    e.stopPropagation();
                    handleSelect(child.id);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === child.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {child.name}
                </div>
              ))}
            </div>
          );
        })(),
        document.body
      )}
    </>
  );
}
