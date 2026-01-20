import { useState, useRef, useEffect } from 'react';
import { ModMeta, AchievementNode } from '../types';

type Props = {
  mod: ModMeta;
  onUpdateNodes: (nodes: AchievementNode[]) => void;
  onSwitchMode: () => void;
};

type ModalType = null | 'select-item' | 'set-parent' | 'edit-description';

export const AchievementNodeEditor = ({ mod, onUpdateNodes, onSwitchMode }: Props) => {
  const [nodes, setNodes] = useState<AchievementNode[]>(mod.achievementGraph?.nodes || []);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 获取节点可见位置
  const getNodePos = (node: AchievementNode) => {
    if (node.position) return node.position;
    // 默认位置分布
    const index = nodes.indexOf(node);
    return {
      x: 100 + (index % 3) * 150,
      y: 100 + Math.floor(index / 3) * 150
    };
  };

  // 创建根节点
  const handleCreateRootNode = () => {
    const newNode: AchievementNode = {
      id: crypto.randomUUID(),
      name: `节点 ${nodes.length + 1}`,
      parentNodeIds: [],
      position: {
        x: 100 + (nodes.length % 3) * 150,
        y: 100 + Math.floor(nodes.length / 3) * 150
      }
    };
    setNodes([...nodes, newNode]);
  };

  // 创建子节点
  const handleCreateChildNode = () => {
    if (!selectedNodeId) return;
    const selectedPos = getNodePos(nodes.find((n) => n.id === selectedNodeId)!);
    const newNode: AchievementNode = {
      id: crypto.randomUUID(),
      name: `子节点 ${nodes.length + 1}`,
      parentNodeIds: [selectedNodeId],
      position: {
        x: selectedPos.x + 120,
        y: selectedPos.y + 80
      }
    };
    setNodes([...nodes, newNode]);
  };

  // 删除节点
  const handleDeleteNode = (nodeId: string) => {
    if (confirm('确定要删除此节点吗？')) {
      setNodes((prev) => {
        const filtered = prev.filter((n) => n.id !== nodeId);
        // 删除对该节点的引用
        return filtered.map((n) => ({
          ...n,
          parentNodeIds: n.parentNodeIds.filter((id) => id !== nodeId)
        }));
      });
      setSelectedNodeId(null);
    }
  };

  // 设置节点物品
  const handleSelectItem = (itemId: string) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === selectedNodeId ? { ...n, itemId } : n
      )
    );
    setModalType(null);
  };

  // 设置父节点
  const handleSetParent = (parentNodeId: string) => {
    if (!selectedNodeId || selectedNodeId === parentNodeId) return;

    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== selectedNodeId) return n;
        
        // 检查是否会形成循环依赖
        const wouldCreateCycle = isAncestor(parentNodeId, selectedNodeId, prev);
        if (wouldCreateCycle) {
          alert('无法添加此父节点，会形成循环依赖');
          return n;
        }

        const newParents = n.parentNodeIds.includes(parentNodeId)
          ? n.parentNodeIds.filter((id) => id !== parentNodeId)
          : [...n.parentNodeIds, parentNodeId];

        return { ...n, parentNodeIds: newParents };
      })
    );
    setModalType(null);
  };

  // 检查是否为祖先节点（用于检测循环依赖）
  const isAncestor = (potentialAncestorId: string, nodeId: string, nodeList: AchievementNode[]): boolean => {
    const node = nodeList.find((n) => n.id === nodeId);
    if (!node) return false;

    for (const parentId of node.parentNodeIds) {
      if (parentId === potentialAncestorId) return true;
      if (isAncestor(potentialAncestorId, parentId, nodeList)) return true;
    }
    return false;
  };

  // 获取可用的父节点（排除自身和子孙节点）
  const getAvailableParentNodes = () => {
    if (!selectedNodeId) return [];

    const isDescendant = (parentId: string, targetId: string): boolean => {
      const parent = nodes.find((n) => n.id === parentId);
      if (!parent) return false;
      if (parent.parentNodeIds.includes(targetId)) return true;
      return parent.parentNodeIds.some((id) => isDescendant(id, targetId));
    };

    return nodes.filter((n) => 
      n.id !== selectedNodeId && !isDescendant(selectedNodeId, n.id)
    );
  };

  // 绘制连线
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // 绘制背景
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 获取动画时间用于泛光效果
    const time = Date.now() / 1000;

    for (const node of nodes) {
      const fromPos = getNodePos(node);
      
      for (const parentId of node.parentNodeIds) {
        const parentNode = nodes.find((n) => n.id === parentId);
        if (!parentNode) continue;

        const toPos = getNodePos(parentNode);

        // 绘制直线连接（主线）
        const alpha = 0.4 + 0.2 * Math.sin(time * 2);  // 泛光效果
        ctx.strokeStyle = `rgba(124, 242, 156, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(fromPos.x + 30, fromPos.y + 30);
        ctx.lineTo(toPos.x + 30, toPos.y + 30);
        ctx.stroke();

        // 绘制泛光光晕（外层）
        ctx.strokeStyle = `rgba(124, 242, 156, ${0.1 + 0.1 * Math.sin(time * 2)})`;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(fromPos.x + 30, fromPos.y + 30);
        ctx.lineTo(toPos.x + 30, toPos.y + 30);
        ctx.stroke();

        // 绘制箭头
        const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
        const arrowSize = 10;
        const arrowPos = {
          x: toPos.x + 30 - Math.cos(angle) * 20,
          y: toPos.y + 30 - Math.sin(angle) * 20
        };

        ctx.fillStyle = `rgba(124, 242, 156, ${0.6 + 0.2 * Math.sin(time * 2)})`;
        ctx.beginPath();
        ctx.moveTo(arrowPos.x, arrowPos.y);
        ctx.lineTo(
          arrowPos.x - Math.cos(angle - Math.PI / 6) * arrowSize,
          arrowPos.y - Math.sin(angle - Math.PI / 6) * arrowSize
        );
        ctx.lineTo(
          arrowPos.x - Math.cos(angle + Math.PI / 6) * arrowSize,
          arrowPos.y - Math.sin(angle + Math.PI / 6) * arrowSize
        );
        ctx.closePath();
        ctx.fill();
      }
    }

    // 每帧重新绘制以保持动画流畅
    const frameId = requestAnimationFrame(() => {});
    return () => cancelAnimationFrame(frameId);
  }, [nodes]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={onSwitchMode}
          style={{
            padding: '6px 12px',
            background: 'rgba(109, 211, 255, 0.1)',
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600
          }}
        >
          ← 返回分类
        </button>
        <span className="small">成就节点编辑器</span>
      </div>

      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        {/* 左侧：节点画布 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="panel glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1
              }}
            />
            <div style={{ position: 'relative', flex: 1, overflow: 'auto', zIndex: 2 }}>
              {nodes.map((node) => {
                const pos = getNodePos(node);
                const item = node.itemId ? mod.items.find((i) => i.id === node.itemId) : null;
                const isSelected = node.id === selectedNodeId;

                return (
                  <div
                    key={node.id}
                    style={{
                      position: 'absolute',
                      left: `${pos.x}px`,
                      top: `${pos.y}px`,
                      zIndex: isSelected ? 10 : 5
                    }}
                  >
                    <button
                      onClick={() => {
                        setSelectedNodeId(node.id);
                      }}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 12,
                        border: isSelected ? '2px solid var(--accent-strong)' : '1px solid var(--border)',
                        background: isSelected
                          ? 'rgba(124, 242, 156, 0.15)'
                          : item
                          ? 'rgba(109, 211, 255, 0.1)'
                          : 'rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                        transition: 'all 0.15s ease',
                        color: 'var(--text)',
                        padding: 0,
                        overflow: 'hidden'
                      }}
                      title={item?.name || node.name}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setSelectedNodeId(node.id);
                      }}
                    >
                      {item && item.texture ? (
                        <img
                          src={item.texture}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            padding: 4
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        '⭐'
                      )}
                    </button>
                    <div style={{ fontSize: 10, textAlign: 'center', marginTop: 4, maxWidth: 60 }} className="muted">
                      {node.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 右侧：控制面板 */}
        <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* 按钮菜单 */}
          <div className="panel glass" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={handleCreateRootNode}
              style={{
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
              ➕ 创建根节点
            </button>
          </div>

          {/* 节点菜单（选中节点时） */}
          {selectedNode && (
            <div className="panel glass" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>
                选中节点：{selectedNode.name}
              </div>

              <button
                onClick={handleCreateChildNode}
                style={{
                  padding: '6px 10px',
                  background: 'rgba(109, 211, 255, 0.1)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 11,
                  transition: 'all 0.15s ease'
                }}
              >
                ➕ 创建子节点
              </button>

              <button
                onClick={() => setModalType('select-item')}
                style={{
                  padding: '6px 10px',
                  background: 'rgba(109, 211, 255, 0.1)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 11,
                  transition: 'all 0.15s ease'
                }}
              >
                📦 设置物品
                {selectedNode.itemId && ` ✓`}
              </button>

              <button
                onClick={() => setModalType('edit-description')}
                style={{
                  padding: '6px 10px',
                  background: 'rgba(109, 211, 255, 0.1)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 11,
                  transition: 'all 0.15s ease'
                }}
              >
                📝 设置描述
                {selectedNode.description && ` ✓`}
              </button>

              <button
                onClick={() => setModalType('set-parent')}
                style={{
                  padding: '6px 10px',
                  background: 'rgba(109, 211, 255, 0.1)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 11,
                  transition: 'all 0.15s ease'
                }}
              >
                🔗 设置父节点
                {selectedNode.parentNodeIds.length > 0 && ` (${selectedNode.parentNodeIds.length})`}
              </button>

              <button
                onClick={() => handleDeleteNode(selectedNode.id)}
                style={{
                  padding: '6px 10px',
                  background: 'rgba(255, 68, 68, 0.1)',
                  border: '1px solid rgba(255, 68, 68, 0.3)',
                  color: '#ff4444',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 11,
                  transition: 'all 0.15s ease'
                }}
              >
                🗑️ 删除节点
              </button>
            </div>
          )}

          {/* 更新按钮 */}
          <button
            onClick={() => {
              onUpdateNodes(nodes);
            }}
            style={{
              padding: '10px 12px',
              background: 'var(--accent-strong)',
              border: 'none',
              color: '#000',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.15s ease',
              marginTop: 'auto'
            }}
          >
            ✅ 保存更改
          </button>
        </div>
      </div>

      {/* 物品选择弹窗 */}
      {modalType === 'select-item' && (
        <div className="modal-backdrop" onClick={() => setModalType(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="small">选择物品</div>
                <strong>为节点分配物品</strong>
              </div>
              <button className="button" onClick={() => setModalType(null)}>
                关闭
              </button>
            </div>
            
            {/* 分类筛选选项卡 */}
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                <button
                  onClick={() => setSelectedCategory(null)}
                  style={{
                    padding: '4px 10px',
                    background: selectedCategory === null ? 'rgba(124, 242, 156, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    border: selectedCategory === null ? '1px solid var(--accent-strong)' : '1px solid var(--border)',
                    color: 'var(--text)',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  全部
                </button>
                {mod.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '4px 10px',
                      background: selectedCategory === cat.id ? 'rgba(124, 242, 156, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                      border: selectedCategory === cat.id ? '1px solid var(--accent-strong)' : '1px solid var(--border)',
                      color: 'var(--text)',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 11,
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-body" style={{ maxHeight: 500, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 6 }}>
                {mod.items
                  .filter((item) => selectedCategory === null || item.currentCategoryId === selectedCategory)
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectItem(item.id)}
                      style={{
                        aspectRatio: '1',
                        background: selectedNode?.itemId === item.id
                          ? 'rgba(124, 242, 156, 0.2)'
                          : 'rgba(255, 255, 255, 0.08)',
                        border: selectedNode?.itemId === item.id
                          ? '2px solid var(--accent-strong)'
                          : '1px solid var(--border)',
                        borderRadius: 8,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        transition: 'all 0.15s ease',
                        overflow: 'hidden',
                        padding: 0,
                        minWidth: 0
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
                            padding: 2
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        '📦'
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 父节点选择弹窗 */}
      {modalType === 'set-parent' && (
        <div className="modal-backdrop" onClick={() => setModalType(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="small">设置父节点</div>
                <strong>选择一个或多个父节点</strong>
              </div>
              <button className="button" onClick={() => setModalType(null)}>
                完成
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: 400, overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {getAvailableParentNodes().length > 0 ? (
                  getAvailableParentNodes().map((node) => {
                    const isParent = selectedNode?.parentNodeIds.includes(node.id);
                    const item = node.itemId ? mod.items.find((i) => i.id === node.itemId) : null;

                    return (
                      <button
                        key={node.id}
                        onClick={() => handleSetParent(node.id)}
                        style={{
                          padding: '10px 12px',
                          background: isParent
                            ? 'rgba(124, 242, 156, 0.2)'
                            : 'rgba(255, 255, 255, 0.08)',
                          border: isParent
                            ? '1px solid var(--accent-strong)'
                            : '1px solid var(--border)',
                          borderRadius: 6,
                          color: 'var(--text)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: 12,
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontSize: 24 }}>
                          {item && item.texture ? (
                            <img
                              src={item.texture}
                              alt={item.name}
                              style={{ width: 28, height: 28, objectFit: 'contain' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            '⭐'
                          )}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>{node.name}</div>
                          {item && (
                            <div className="small muted">{item.name}</div>
                          )}
                        </div>
                        {isParent && <span style={{ color: 'var(--accent-strong)' }}>✓</span>}
                      </button>
                    );
                  })
                ) : (
                  <div className="muted">无可用父节点</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 描述编辑弹窗 */}
      {modalType === 'edit-description' && selectedNode && (
        <div className="modal-backdrop" onClick={() => setModalType(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="small">编辑描述</div>
                <strong>{selectedNode.name}</strong>
              </div>
              <button className="button" onClick={() => setModalType(null)}>
                关闭
              </button>
            </div>
            <div className="modal-body">
              <textarea
                defaultValue={selectedNode.description || ''}
                placeholder="输入节点描述..."
                onBlur={(e) => {
                  setNodes((prev) =>
                    prev.map((n) =>
                      n.id === selectedNode.id
                        ? { ...n, description: e.target.value }
                        : n
                    )
                  );
                }}
                style={{
                  width: '100%',
                  minHeight: 120,
                  padding: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  color: 'var(--text)',
                  fontSize: 12,
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
