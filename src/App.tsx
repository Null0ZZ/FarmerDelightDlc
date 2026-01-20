import { useEffect, useMemo, useState } from 'react';
import { ModDetail } from './components/ModDetail';
import { ModList } from './components/ModList';
import { ConfigManager } from './components/ConfigManager';
import { AchievementNodeEditor } from './components/AchievementNodeEditor';
import { Contribution, ModMeta, AchievementNode } from './types';

type EditorMode = 'classification' | 'achievement-nodes';

function App() {
  const [mods, setMods] = useState<ModMeta[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [selectedModId, setSelectedModId] = useState<string>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
  const [editorMode, setEditorMode] = useState<EditorMode>('classification');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        // 从 test 文件夹加载默认配置
        const response = await fetch('/test/default-config.json');
        if (!response.ok) throw new Error('无法加载默认配置');
        
        const configText = await response.text();
        const config = JSON.parse(configText);
        
        if (config.mods && Array.isArray(config.mods)) {
          setMods(config.mods);
          if (config.mods.length > 0) {
            setSelectedModId(config.mods[0]?.id);
            setSelectedCategoryId(config.mods[0]?.categories[0]?.id);
          }
        }
      } catch (err) {
        console.error('加载配置失败:', err);
        setStatus('配置加载失败');
      }
    };

    load();
  }, []);

  const selectedMod = useMemo(() => mods.find((m) => m.id === selectedModId), [mods, selectedModId]);

  const handleReassignItem = async (itemId: string, newCategoryId: string) => {
    if (!selectedMod) return;
    setStatus('分类中…');
    try {
      // 直接在本地更新数据，不依赖 modService 的内部存储
      setMods((prevMods) => {
        return prevMods.map((mod) => {
          if (mod.id !== selectedMod.id) return mod;
          
          return {
            ...mod,
            items: mod.items.map((item) => {
              if (item.id === itemId) {
                return { ...item, currentCategoryId: newCategoryId };
              }
              return item;
            })
          };
        });
      });

      // 记录贡献
      const newContribution = {
        id: crypto.randomUUID(),
        modId: selectedMod.id,
        itemId,
        newCategoryId,
        contributor: '玩家',
        createdAt: new Date().toISOString(),
        status: 'pending' as const
      };
      setContributions((prev) => [newContribution, ...prev]);
      
      setStatus('分类已更新');
      setTimeout(() => setStatus(''), 2000);
    } catch (err) {
      console.error(err);
      setStatus('操作失败');
    }
  };

  const handleAddCategory = (name: string) => {
    if (!selectedMod) return;
    setStatus('添加分类中…');
    try {
      const categoryId = name.toLowerCase().replace(/\s+/g, '-');
      // 检查是否已存在
      if (selectedMod.categories.some(c => c.id === categoryId)) {
        setStatus('分类已存在');
        setTimeout(() => setStatus(''), 2000);
        return;
      }
      
      setMods((prevMods) => {
        return prevMods.map((mod) => {
          if (mod.id !== selectedMod.id) return mod;
          return {
            ...mod,
            categories: [...mod.categories, { id: categoryId, name, description: '' }]
          };
        });
      });
      
      setStatus('分类已添加');
      setTimeout(() => setStatus(''), 2000);
    } catch (err) {
      console.error(err);
      setStatus('添加失败');
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!selectedMod) return;
    setStatus('删除分类中…');
    try {
      setMods((prevMods) => {
        return prevMods.map((mod) => {
          if (mod.id !== selectedMod.id) return mod;
          
          return {
            ...mod,
            categories: mod.categories.filter(c => c.id !== categoryId),
            // 将该分类下的物品设为未分类状态
            items: mod.items.map(item => 
              item.currentCategoryId === categoryId 
                ? { ...item, currentCategoryId: '' }
                : item
            )
          };
        });
      });
      
      // 清除该分类的选中状态
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId('');
      }
      
      setStatus('分类已删除');
      setTimeout(() => setStatus(''), 2000);
    } catch (err) {
      console.error(err);
      setStatus('删除失败');
    }
  };

  const handleReorderItems = (_categoryId: string, itemIds: string[]) => {
    if (!selectedMod) return;
    setStatus('排序中…');
    try {
      setMods((prevMods) => {
        return prevMods.map((mod) => {
          if (mod.id !== selectedMod.id) return mod;
          
          // 创建新的 items 数组，保持原有顺序但调整分类内的顺序
          const itemsMap = new Map(mod.items.map(item => [item.id, item]));
          const reorderedItems = itemIds.map(id => itemsMap.get(id)).filter(Boolean) as typeof mod.items;
          const otherItems = mod.items.filter(item => !itemIds.includes(item.id));
          
          return {
            ...mod,
            items: [...reorderedItems, ...otherItems]
          };
        });
      });
      
      setStatus('排序已更新');
      setTimeout(() => setStatus(''), 1500);
    } catch (err) {
      console.error(err);
      setStatus('排序失败');
    }
  };

  const handleUpdateAchievementNodes = (nodes: AchievementNode[]) => {
    if (!selectedMod) return;
    setMods((prevMods) => {
      return prevMods.map((mod) => {
        if (mod.id !== selectedMod.id) return mod;
        return {
          ...mod,
          achievementGraph: {
            modId: mod.id,
            nodes
          }
        };
      });
    });
    setStatus('成就节点已更新');
    setTimeout(() => setStatus(''), 1500);
  };

  const filteredContrib = useMemo(() => {
    if (!selectedModId) return contributions;
    return contributions.filter((c) => c.modId === selectedModId).slice(0, 10);
  }, [contributions, selectedModId]);

  return (
    <div className="app-shell">
      <section className="hero glass">
        <h1>模组共创中心</h1>
        <p>为模组物品分类做贡献，让分类体系更合理。选择分类后在右侧网格中点击物品可快速移动分类。</p>
        {status && <div className="state-pill" style={{ marginTop: 12 }}>{status}</div>}
        <div style={{ marginTop: 12 }}>
          <ConfigManager mods={mods} onImport={(newMods) => {
            setMods(newMods);
            if (newMods.length > 0) {
              setSelectedModId(newMods[0]?.id);
              setSelectedCategoryId(newMods[0]?.categories[0]?.id);
            }
          }} />
        </div>
      </section>

      <div className="main-grid">
        <ModList mods={mods} activeId={selectedModId} onSelect={(id) => {
          setSelectedModId(id);
          const mod = mods.find(m => m.id === id);
          if (mod && mod.categories.length > 0) {
            setSelectedCategoryId(mod.categories[0].id);
          }
        }} />
        
        {editorMode === 'classification' && (
          <ModDetail
            mod={selectedMod}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            onReassignItem={handleReassignItem}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onReorderItems={handleReorderItems}
            onSwitchMode={() => setEditorMode('achievement-nodes')}
          />
        )}
        
        {editorMode === 'achievement-nodes' && selectedMod && (
          <AchievementNodeEditor
            mod={selectedMod}
            onUpdateNodes={handleUpdateAchievementNodes}
            onSwitchMode={() => setEditorMode('classification')}
          />
        )}
      </div>

      {filteredContrib.length > 0 && (
        <section className="panel glass">
          <div className="section-title">
            <span>最近协作</span>
            <span className="small">{filteredContrib.length} 条记录</span>
          </div>
          <div className="list">
            {filteredContrib.map((c) => (
              <div key={c.id} className="state-pill">
                <strong>{c.contributor}</strong>
                <span>→ {c.newCategoryId}</span>
                <span className="small">{new Date(c.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
