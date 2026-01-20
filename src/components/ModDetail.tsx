import { useState } from 'react';
import { ModMeta } from '../types';

type Props = {
  mod?: ModMeta;
  selectedCategoryId?: string;
  onSelectCategory: (categoryId: string) => void;
  onReassignItem: (itemId: string, newCategoryId: string) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onReorderItems: (categoryId: string, itemIds: string[]) => void;
  onSwitchMode?: () => void;
};

export const ModDetail = ({
  mod,
  selectedCategoryId,
  onSelectCategory,
  onReassignItem,
  onAddCategory,
  onDeleteCategory,
  onReorderItems,
  onSwitchMode
}: Props) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  if (!mod) {
    return (
      <div className="panel glass">
        <div className="muted">请选择一个模组查看详情</div>
      </div>
    );
  }

  const selectedCategory = mod.categories.find((c) => c.id === selectedCategoryId);
  const itemsInCategory = selectedCategoryId
    ? mod.items.filter((i) => i.currentCategoryId === selectedCategoryId && i.currentCategoryId !== '')
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

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('确定要删除此分类吗？该分类下的物品会变为未分类状态。')) {
      onDeleteCategory(categoryId);
    }
  };

  const handleDragStart = (itemId: string) => {
    setDraggedItemId(itemId);
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    setDragOverItemId(itemId);
  };

  const handleDrop = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    if (draggedItemId && draggedItemId !== targetItemId && selectedCategoryId) {
      const newOrder = [...itemsInCategory];
      const draggedIndex = newOrder.findIndex(item => item.id === draggedItemId);
      const targetIndex = newOrder.findIndex(item => item.id === targetItemId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedItem] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedItem);
        onReorderItems(selectedCategoryId, newOrder.map(item => item.id));
      }
    }
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverItemId(null);
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
        {onSwitchMode && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              style={{
                flex: 1,
                padding: '8px 12px',
                background: 'rgba(124, 242, 156, 0.1)',
                border: '1px solid var(--accent-strong)',
                color: 'var(--accent-strong)',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
            >
              📂 分类
            </button>
            <button
              onClick={onSwitchMode}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: 'rgba(109, 211, 255, 0.1)',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
            >
              ⭐ 编辑节点
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('switch-to-modeling'))}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: 'rgba(255, 193, 109, 0.1)',
                border: '1px solid #ffb366',
                color: '#ffb366',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
            >
              🎨 建模工具
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0 }}>
        {/* 顶部：分类列表 */}
        <div className="panel glass" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', maxHeight: '220px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div className="section-title" style={{ fontSize: 13, margin: 0 }}>分类</div>
            <button
              onClick={() => setShowAddCategory(!showAddCategory)}
              style={{
                padding: '4px 8px',
                fontSize: 12,
                background: 'rgba(124, 242, 156, 0.1)',
                border: '1px solid var(--accent-strong)',
                color: 'var(--accent-strong)',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {showAddCategory ? '取消' : '➕ 新增'}
            </button>
          </div>

          {showAddCategory && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <input
                type="text"
                placeholder="分类名称"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCategory();
                  if (e.key === 'Escape') setShowAddCategory(false);
                }}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  color: 'var(--text)',
                  fontSize: 12,
                  outline: 'none'
                }}
              />
              <button
                onClick={handleAddCategory}
                style={{
                  padding: '6px 12px',
                  background: 'var(--accent-strong)',
                  border: 'none',
                  color: '#000',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              >
                确认
              </button>
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 6 }}>
            <div className="categories-grid">
              {mod.categories.map((cat) => {
                const count = mod.items.filter((i) => i.currentCategoryId === cat.id).length;
                return (
                  <div key={cat.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <button
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
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#ff4444',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                    title="删除分类"
                  >
                    ✕
                  </button>
                </div>
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
              <div className="items-grid">
                {itemsInCategory.map((item, index) => (
                <div
                  key={`${selectedCategoryId}-${item.id}-${index}`}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                  onDrop={(e) => handleDrop(e, item.id)}
                  onDragEnd={handleDragEnd}
                  style={{
                    aspectRatio: '1',
                    background: dragOverItemId === item.id ? 'rgba(124, 242, 156, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: draggedItemId === item.id ? '2px dashed var(--accent-strong)' : '1px solid var(--border)',
                    borderRadius: 12,
                    cursor: draggedItemId ? 'grabbing' : 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    transition: 'all 0.15s ease',
                    opacity: draggedItemId === item.id ? 0.5 : 0.8,
                    overflow: 'hidden'
                  }}
                  onClick={() => handleItemClick(item.id)}
                  onMouseEnter={(e) => {
                    if (!draggedItemId) {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!draggedItemId) {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.opacity = '0.8';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
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
