import { useState } from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function InfoPanel({ title, children, defaultOpen = false }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border dark:border-border-dark rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-surface-alt dark:bg-surface-dark-alt hover:bg-border/30 dark:hover:bg-border-dark/30 transition-colors text-left"
      >
        <span className="font-medium text-sm">{title}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 text-sm text-text-muted dark:text-text-dark-muted leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}
