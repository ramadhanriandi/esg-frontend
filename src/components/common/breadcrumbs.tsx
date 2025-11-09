import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      className={cn(
        "flex items-center space-x-2 text-sm text-muted-foreground",
        className,
      )}
    >
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
          {item.href ? (
            <RouterLink
              to={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </RouterLink>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
