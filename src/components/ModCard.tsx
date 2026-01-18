import clsx from 'clsx';
import { ModMeta } from '../types';

type Props = {
  mod: ModMeta;
  active?: boolean;
  onSelect: (id: string) => void;
};

export const ModCard = ({ mod, active, onSelect }: Props) => {
  return (
    <div className={clsx('card', active && 'active')} onClick={() => onSelect(mod.id)}>
      <div className="section-title">
        <div>
          <strong>{mod.name}</strong>
          <div className="small">v{mod.version}</div>
        </div>
        <span className="state-pill">更新 {mod.lastUpdated}</span>
      </div>
      <div className="muted">{mod.summary}</div>
      <div className="badges">
        {mod.tags.map((tag) => (
          <span key={tag} className="badge">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};
