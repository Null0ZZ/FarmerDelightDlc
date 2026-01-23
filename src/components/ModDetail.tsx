import { useState, useRef } from 'react';
import { ModMeta } from '../types';

type Props = {
  mod?: ModMeta;
  selectedCategoryId?: string;
  isAdmin?: boolean;
  onSelectCategory: (categoryId: string) => void;
  onReassignItem: (itemId: string, newCategoryId: string) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onRenameCategory: (categoryId: string, newName: string) => void;
  onReorderItems: (categoryId: string, itemIds: string[]) => void;
  onSwitchMode?: () => void;
};

export const ModDetail = ({
  mod,
  selectedCategoryId,
  isAdmin = false,
  onSelectCategory,
  onReassignItem,
  onAddCategory,
  onDeleteCategory,
  onRenameCategory,
  onReorderItems,
  onSwitchMode
}: Props) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  
  // 长按下载相关状态
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string; texture: string; name: string } | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressItem = useRef<{ id: string; texture: string; name: string } | null>(null);
  const didLongPress = useRef(false); // 标记是否刚刚长按过，用于阻止click事件

  // 处理长按开始
  const handleLongPressStart = (itemId: string, texture: string, name: string, e: React.MouseEvent | React.TouchEvent) => {
    if (!isAdmin) return;
    longPressItem.current = { id: itemId, texture, name };
    didLongPress.current = false;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true; // 标记长按成功
      setContextMenu({ x: clientX, y: clientY, itemId, texture, name });
    }, 500); // 500ms 长按触发
  };

  // 处理长按结束
  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // 处理触摸移动（取消长按）
  const handleTouchMove = () => {
    handleLongPressEnd();
    didLongPress.current = false;
  };

  // 下载图片
  const handleDownloadTexture = async () => {
    if (!contextMenu || !isAdmin) return;
    try {
      const response = await fetch(contextMenu.texture);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contextMenu.name}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('下载失败:', err);
      alert('下载失败，请重试');
    }
    setContextMenu(null);
  };

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
  
  // 搜索过滤所有物品
  const searchResults = searchQuery.trim()
    ? mod.items.filter((item) => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  const selectedItem = selectedItemId 
    ? mod.items.find(i => i.id === selectedItemId)
    : null;

  const handleItemClick = (itemId: string) => {
    // 如果刚刚长按过（显示了下载菜单），不触发点击
    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }
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

  const handleRenameCategory = (categoryId: string) => {
    if (editingCategoryName.trim() && editingCategoryName.trim() !== mod.categories.find(c => c.id === categoryId)?.name) {
      onRenameCategory(categoryId, editingCategoryName.trim());
    }
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const startEditingCategory = (categoryId: string, currentName: string) => {
    setEditingCategoryId(categoryId);
    setEditingCategoryName(currentName);
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
                const isEditing = editingCategoryId === cat.id;
                return (
                  <div key={cat.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameCategory(cat.id);
                            if (e.key === 'Escape') {
                              setEditingCategoryId(null);
                              setEditingCategoryName('');
                            }
                          }}
                          autoFocus
                          style={{
                            padding: '6px 8px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid var(--accent)',
                            borderRadius: 6,
                            color: 'var(--text)',
                            fontSize: 12,
                            outline: 'none'
                          }}
                        />
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            onClick={() => handleRenameCategory(cat.id)}
                            style={{
                              flex: 1,
                              padding: '4px',
                              background: 'var(--accent-strong)',
                              border: 'none',
                              color: '#000',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 10
                            }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setEditingCategoryId(null);
                              setEditingCategoryName('');
                            }}
                            style={{
                              flex: 1,
                              padding: '4px',
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid var(--border)',
                              color: 'var(--text)',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 10
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
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
                      onDoubleClick={() => startEditingCategory(cat.id, cat.name)}
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
                      title={`${cat.name} (双击编辑名称)`}
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
                  )}
                  {!isEditing && (
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
                  )}
                </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 底部：物品网格 */}
        <div className="panel glass" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', flex: 1 }}>
          {/* 搜索框 */}
          <div style={{ marginBottom: 8 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 搜索物品..."
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontSize: 13,
                outline: 'none',
                transition: 'all 0.15s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
            />
          </div>

          {/* 搜索结果 */}
          {searchQuery.trim() && (
            <div style={{ marginBottom: 12 }}>
              <div className="section-title" style={{ fontSize: 12, marginBottom: 6, color: 'var(--text-muted)' }}>
                搜索结果 ({searchResults.length})
              </div>
              {searchResults.length > 0 ? (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', 
                  gap: 6,
                  maxHeight: 120,
                  overflowY: 'auto',
                  padding: 4
                }}>
                  {searchResults.slice(0, 20).map((item, index) => (
                    <div
                      key={`search-${item.id}-${index}`}
                      onClick={() => handleItemClick(item.id)}
                      style={{
                        aspectRatio: '1',
                        background: 'rgba(109, 211, 255, 0.1)',
                        border: '1px solid var(--accent)',
                        borderRadius: 8,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.background = 'rgba(109, 211, 255, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.background = 'rgba(109, 211, 255, 0.1)';
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
                            padding: 2,
                            WebkitTouchCallout: 'none',
                            WebkitUserSelect: 'none',
                            userSelect: 'none',
                            pointerEvents: 'none'
                          }}
                          draggable={false}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <span style={{ fontSize: 16 }}>📦</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: 8 }}>
                  未找到匹配的物品
                </div>
              )}
              {searchResults.length > 20 && (
                <div style={{ color: 'var(--text-muted)', fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                  还有 {searchResults.length - 20} 个结果...
                </div>
              )}
            </div>
          )}

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
                  onMouseDown={(e) => handleLongPressStart(item.id, item.texture || '', item.name, e)}
                  onMouseUp={handleLongPressEnd}
                  onTouchStart={(e) => handleLongPressStart(item.id, item.texture || '', item.name, e)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleLongPressEnd}
                  onContextMenu={(e) => {
                    if (isAdmin && item.texture) {
                      e.preventDefault();
                      setContextMenu({ x: e.clientX, y: e.clientY, itemId: item.id, texture: item.texture, name: item.name });
                    }
                  }}
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
                    handleLongPressEnd();
                    if (!draggedItemId) {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.opacity = '0.8';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                  title={isAdmin ? `${item.name} (长按或右键下载)` : item.name}
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
                        padding: 4,
                        // 阻止浏览器原生长按菜单
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                        pointerEvents: 'none'
                      }}
                      draggable={false}
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

      {/* 管理员右键/长按菜单 */}
      {contextMenu && isAdmin && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999
          }}
          onClick={() => setContextMenu(null)}
        >
          <div
            style={{
              position: 'absolute',
              top: contextMenu.y,
              left: contextMenu.x,
              background: 'rgba(30, 30, 40, 0.98)',
              border: '1px solid var(--accent)',
              borderRadius: 8,
              padding: 4,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
              minWidth: 150
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
              {contextMenu.name}
            </div>
            <button
              onClick={handleDownloadTexture}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 4,
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(109, 211, 255, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              ⬇️ 下载图标
            </button>
            <button
              onClick={() => setContextMenu(null)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 4,
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              ✕ 取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
