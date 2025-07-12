"use client"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const pathname = usePathname()
  
  // Generate breadcrumb items from pathname if not provided
  const breadcrumbItems = items || generateBreadcrumbFromPath(pathname)

  return (
    <nav className={`flex items-center space-x-1 text-sm text-muted-foreground ${className}`}>
      <Link 
        href="/" 
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home size={16} className="mr-1" />
        <span className="hidden sm:inline">Home</span>
      </Link>
      
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight size={16} className="mx-1" />
          {item.href ? (
            <Link 
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

function generateBreadcrumbFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  
  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    
    return {
      label,
      href: index === segments.length - 1 ? undefined : href
    }
  })
} 