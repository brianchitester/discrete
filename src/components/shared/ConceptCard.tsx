interface Props {
  title: string;
  description: string;
  href: string;
  icon: string;
  progress: number; // 0-100
}

export default function ConceptCard({ title, description, href, icon, progress }: Props) {
  return (
    <a
      href={href}
      className="group block p-6 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark hover:border-primary dark:hover:border-primary-light transition-all hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl" role="img">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
            {title}
          </h3>
          <p className="text-sm text-text-muted dark:text-text-dark-muted mt-1">
            {description}
          </p>
          {progress > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-text-muted dark:text-text-dark-muted mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-surface-alt dark:bg-surface-dark-alt rounded-full h-1.5">
                <div
                  className="bg-accent-green h-1.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
