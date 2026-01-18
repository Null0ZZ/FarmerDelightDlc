import { FormEvent, useMemo, useState } from 'react';
import { Category, Contribution } from '../types';
import { CategoryPill } from './CategoryPill';

type Props = {
  open: boolean;
  itemName: string;
  categories: Category[];
  currentCategoryId?: string;
  contributions: Contribution[];
  onSelectCategory: (categoryId: string) => void;
  onCreateCategory: (name: string, description?: string) => void;
  onClose: () => void;
};

export const ClassificationModal = ({
  open,
  itemName,
  categories,
  currentCategoryId,
  contributions,
  onSelectCategory,
  onCreateCategory,
  onClose
}: Props) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const recent = useMemo(() => contributions.slice(0, 4), [contributions]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateCategory(name.trim(), desc.trim() || undefined);
    setName('');
    setDesc('');
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="small">共创分类</div>
            <strong>{itemName}</strong>
          </div>
          <button className="button" onClick={onClose}>
            关闭
          </button>
        </div>
        <div className="modal-body">
          <section>
            <div className="section-title">
              <span>选择分类</span>
              {currentCategoryId && <span className="state-pill">当前：{currentCategoryId}</span>}
            </div>
            <div className="category-grid">
              {categories.map((cat) => (
                <CategoryPill
                  key={cat.id}
                  category={cat}
                  active={cat.id === currentCategoryId}
                  onClick={() => onSelectCategory(cat.id)}
                />
              ))}
            </div>
          </section>

          <div className="divider" />

          <section>
            <div className="section-title">
              <span>新增分类</span>
              <span className="small">用于暂时没有合适归类的物品</span>
            </div>
            <form className="list" onSubmit={handleSubmit}>
              <input
                className="input"
                placeholder="分类名称"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="input"
                placeholder="可选描述"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
              <button className="button primary" type="submit" disabled={!name.trim()}>
                创建并加入候选
              </button>
            </form>
          </section>

          <div className="divider" />

          <section>
            <div className="section-title">
              <span>最近贡献</span>
              <span className="small">用于展示玩家协作记录</span>
            </div>
            <div className="list">
              {recent.map((c) => (
                <div key={c.id} className="state-pill">
                  <span>{c.contributor}</span>
                  <span>→ {c.newCategoryId}</span>
                  <span>{new Date(c.createdAt).toLocaleString()}</span>
                  <span>({c.status})</span>
                </div>
              ))}
              {recent.length === 0 && <div className="muted">暂无贡献记录</div>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
