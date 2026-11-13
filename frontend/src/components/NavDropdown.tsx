import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

export interface NavDropdownItem {
  to: string;
  label: string;
}

export function NavDropdown({ label, items }: { label: string; items: NavDropdownItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isActive = items.some((item) => location.pathname.startsWith(item.to.split('?')[0]));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.search]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
          isActive ? 'bg-gold-400 text-xkwanza-950' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-40 mt-1 w-56 overflow-hidden rounded-xl bg-white py-1.5 shadow-xl ring-1 ring-black/5">
          {items.map((item) => {
            const currentFullPath = location.pathname + location.search;
            const itemHasQuery = item.to.includes('?');
            const active = itemHasQuery ? currentFullPath === item.to : location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`block px-4 py-2 text-sm font-medium transition ${
                  active ? 'bg-xkwanza-50 text-xkwanza-700' : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
