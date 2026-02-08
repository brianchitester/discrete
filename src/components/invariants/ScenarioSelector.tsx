import { SCENARIO_INFO, ALL_SCENARIO_TYPES, type ScenarioType } from '../../lib/invariants';

interface Props {
  selected: ScenarioType;
  onSelect: (type: ScenarioType) => void;
  triedScenarios: Set<ScenarioType>;
}

export default function ScenarioSelector({ selected, onSelect, triedScenarios }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {ALL_SCENARIO_TYPES.map((type) => {
        const info = SCENARIO_INFO[type];
        const isSelected = type === selected;
        const tried = triedScenarios.has(type);
        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all
              ${isSelected
                ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light shadow-sm'
                : 'border-border dark:border-border-dark bg-surface-alt dark:bg-surface-dark-alt hover:border-primary/50 dark:hover:border-primary-light/50 text-text dark:text-text-dark'
              }
            `}
          >
            <span className="text-lg">{info.icon}</span>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                {info.title}
                {tried && (
                  <span className="text-accent-green text-xs" title="Tried">&#10003;</span>
                )}
              </div>
              <div className="text-xs text-text-muted dark:text-text-dark-muted font-normal">
                {info.brief}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
