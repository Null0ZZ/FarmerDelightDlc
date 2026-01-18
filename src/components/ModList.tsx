import { useMemo, useState } from 'react';
import { ModMeta } from '../types';
import { ModCard } from './ModCard';

type Props = {
  mods: ModMeta[];
  activeId?: string;
  onSelect: (id: string) => void;
};

export const ModList = ({ mods, activeId, onSelect }: Props) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return mods.filter((m) => {
      const text = `${m.name} ${m.tags.join(' ')} ${m.summary}`.toLowerCase();
      return text.includes(query.toLowerCase());
    });
  }, [mods, query]);

  return (
    <div className="panel glass">
      <div className="section-title">
        <span>模组列表</span>
        <input
          className="input"
          placeholder="搜索模组、标签或描述"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="list">
        {filtered.map((mod) => (
          <ModCard key={mod.id} mod={mod} active={mod.id === activeId} onSelect={onSelect} />
        ))}
        {filtered.length === 0 && <div className="muted">暂无匹配结果</div>}
      </div>
    </div>
  );
};
