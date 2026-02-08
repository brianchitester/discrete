import { complexityClasses, formatNumber } from '../../lib/growth';

interface Props {
  n: number;
  enabledIds: Set<string>;
}

export default function ComplexityTable({ n, enabledIds }: Props) {
  const enabled = complexityClasses.filter(c => enabledIds.has(c.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border dark:border-border-dark">
            <th className="text-left py-2 px-3 text-text-muted dark:text-text-dark-muted font-medium">Class</th>
            <th className="text-left py-2 px-3 text-text-muted dark:text-text-dark-muted font-medium">Notation</th>
            <th className="text-right py-2 px-3 text-text-muted dark:text-text-dark-muted font-medium">f({n})</th>
          </tr>
        </thead>
        <tbody>
          {enabled.map(cls => {
            const val = cls.fn(n);
            const isHuge = val >= 1e12;
            return (
              <tr key={cls.id} className="border-b border-border/50 dark:border-border-dark/50">
                <td className="py-2 px-3 flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm inline-block shrink-0"
                    style={{ backgroundColor: cls.color }}
                  />
                  {cls.label}
                </td>
                <td className="py-2 px-3 font-mono">{cls.notation}</td>
                <td className={`py-2 px-3 text-right font-mono ${isHuge ? 'text-accent-red font-bold' : ''}`}>
                  {formatNumber(val)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
