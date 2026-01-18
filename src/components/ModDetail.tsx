import { useState } from 'react';
import { ModMeta } from '../types';

type Props = {
  mod?: ModMeta;
  selectedCategoryId?: string;
  onSelectCategory: (categoryId: string) => void;
  onReassignItem: (itemId: string, newCategoryId: string) => void;
};

export const ModDetail = ({
  mod,
  selectedCategoryId,
  onSelectCategory,
  onReassignItem
}: Props) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  if (!mod) {
    return (
      <div className="panel glass">
        <div className="muted">请选择一个模组查看详情</div>
      </div>
    );
  }

  const selectedCategory = mod.categories.find((c) => c.id === selectedCategoryId);
  const itemsInCategory = selectedCategoryId
    ? mod.items.filter((i) => i.currentCategoryId === selectedCategoryId)
    : [];
  
  const selectedItem = selectedItemId 
    ? mod.items.find(i => i.id === selectedItemId)
    : null;

  const handleItemClick = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  const handleReassign = (newCategoryId: string) => {
    if (selectedItemId) {
      onReassignItem(selectedItemId, newCategoryId);
      setSelectedItemId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div className="panel glass">
        <div className="small">v{mod.version}</div>
        <h2 style={{ margin: '4px 0 6px' }}>{mod.name}</h2>
        <p className="muted">{mod.summary}</p>
        <div className="badges">
          {mod.tags.map((tag) => (
            <span key={tag} className="badge">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0 }}>
        {/* 顶部：分类列表 */}
        <div className="panel glass" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', maxHeight: '180px' }}>
          <div className="section-title" style={{ fontSize: 13, marginBottom: 8 }}>分类</div>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 6 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 8 }}>
              {mod.categories.map((cat) => {
                const count = mod.items.filter((i) => i.currentCategoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: cat.id === selectedCategoryId ? '1px solid var(--accent-strong)' : '1px solid var(--border)',
                      background: cat.id === selectedCategoryId ? 'rgba(124, 242, 156, 0.06)' : 'transparent',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      overflow: 'hidden'
                    }}
                    onClick={() => onSelectCategory(cat.id)}
                    onMouseEnter={(e) => {
                      if (cat.id !== selectedCategoryId) {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.background = 'rgba(109, 211, 255, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (cat.id !== selectedCategoryId) {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                    title={cat.name}
                  >
                    <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{cat.name}</span>
                    <span style={{ 
                      background: 'rgba(109, 211, 255, 0.2)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: 11,
                      minWidth: '24px',
                      textAlign: 'center'
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 底部：物品网格 */}
        <div className="panel glass" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', flex: 1 }}>
          <div className="section-title" style={{ fontSize: 13, marginBottom: 8 }}>
            {selectedCategory ? `${selectedCategory.name} (${itemsInCategory.length})` : '选择分类'}
          </div>

          {selectedCategoryId && itemsInCategory.length > 0 ? (
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 6 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 8 }}>
                {itemsInCategory.map((item) => (
                <div
                  key={item.id}
                  style={{
                    aspectRatio: '1',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    transition: 'all 0.15s ease',
                    opacity: 0.8,
                    overflow: 'hidden'
                  }}
                  onClick={() => handleItemClick(item.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.opacity = '0.8';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title={item.name}
                >
                  {item.texture ? (
                    <img
                      src={item.texture}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'center',
                        padding: 4
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                ))}
              </div>
            </div>
          ) : selectedCategoryId ? (
            <div className="muted">该分类暂无物品</div>
          ) : null}
        </div>
      </div>

      {/* 物品详情弹窗 */}
      {selectedItem && (
        <div 
          className="modal-backdrop" 
          onClick={() => setSelectedItemId(null)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="small">物品详情</div>
                <strong>{selectedItem.name}</strong>
              </div>
              <button className="button" onClick={() => setSelectedItemId(null)}>
                关闭
              </button>
            </div>
            <div className="modal-body">
              <div>
                <div className="small" style={{ marginBottom: 8 }}>物品 ID</div>
                <div className="state-pill">{selectedItem.id}</div>
              </div>

              <div className="divider" />

              <div>
                <div className="small" style={{ marginBottom: 8 }}>移动到分类</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                  {mod.categories.map((cat) => (
                    <button
                      key={cat.id}
                      className="badge"
                      style={{
                        display: 'block',
                        padding: '10px',
                        background: cat.id === selectedItem.currentCategoryId 
                          ? 'rgba(124, 242, 156, 0.2)' 
                          : 'rgba(255, 255, 255, 0.08)',
                        cursor: 'pointer',
                        border: cat.id === selectedItem.currentCategoryId 
                          ? '1px solid rgba(124, 242, 156, 0.5)'
                          : '1px solid var(--border)',
                        transition: 'all 0.15s ease',
                        fontSize: 12,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      onClick={() => {
                        if (cat.id !== selectedItem.currentCategoryId) {
                          handleReassign(cat.id);
                        }
                      }}
                      title={cat.name}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
