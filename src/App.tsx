import { useEffect, useMemo, useState } from 'react';
import { ModDetail } from './components/ModDetail';
import { ModList } from './components/ModList';
import { ConfigManager } from './components/ConfigManager';
import { AchievementNodeEditor } from './components/AchievementNodeEditor';
import { Contribution, ModMeta, AchievementNode } from './types';
import BmobAuth from './components/BmobAuth';
import { useBmobAuth } from './hooks/useBmobAuth';
import { loadModsForUser, saveMods, updateMods, loadContributionsForUser, saveContributions, updateContributions } from './lib/bmob';
import BlockbenchIntegration from './components/BlockbenchIntegration';

type EditorMode = 'classification' | 'achievement-nodes' | 'modeling';

function App() {
  const { user } = useBmobAuth();
  const [mods, setMods] = useState<ModMeta[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [selectedModId, setSelectedModId] = useState<string>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
  const [editorMode, setEditorMode] = useState<EditorMode>('classification');
  const [status, setStatus] = useState('');
  const [modsObjectId, setModsObjectId] = useState<string>();
  const [contributionsObjectId, setContributionsObjectId] = useState<string>();

  useEffect(() => {
    const load = async () => {
      try {
        if (user) {
          // 用户已登录，从云端加载数据
          setStatus('从云端加载数据…');
          const [modsData, contributionsData] = await Promise.all([
            loadModsForUser(user.objectId, user.sessionToken),
            loadContributionsForUser(user.objectId, user.sessionToken)
          ]);

          if (modsData.length > 0) {
            const modsRecord = modsData[0];
            const loadedMods = JSON.parse(modsRecord.data);
            setMods(loadedMods);
            setModsObjectId(modsRecord.objectId);
            if (loadedMods.length > 0) {
              setSelectedModId(loadedMods[0]?.id);
              setSelectedCategoryId(loadedMods[0]?.categories[0]?.id);
            }
          }

          if (contributionsData.length > 0) {
            const contributionsRecord = contributionsData[0];
            const loadedContributions = JSON.parse(contributionsRecord.data);
            setContributions(loadedContributions);
            setContributionsObjectId(contributionsRecord.objectId);
          }

          setStatus('云端数据已加载');
        } else {
          // 未登录用户，从本地加载默认配置
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
          setStatus('');
        }
      } catch (err) {
        console.error('加载配置失败:', err);
        setStatus('配置加载失败');
      }
    };

    load();
  }, [user]);

  // 监听建模模式切换事件
  useEffect(() => {
    const handleSwitchToModeling = () => {
      setEditorMode('modeling');
    };

    window.addEventListener('switch-to-modeling', handleSwitchToModeling);
    return () => window.removeEventListener('switch-to-modeling', handleSwitchToModeling);
  }, []);

  // 保存模组数据到云端
  const saveModsToCloud = async (updatedMods: ModMeta[]) => {
    if (!user) return;
    try {
      if (modsObjectId) {
        await updateMods(modsObjectId, updatedMods, user.sessionToken);
      } else {
        const result = await saveMods(user.objectId, updatedMods, user.sessionToken);
        setModsObjectId(result.objectId);
      }
    } catch (err) {
      console.error('保存模组数据失败:', err);
    }
  };

  // 保存协作记录到云端
  const saveContributionsToCloud = async (updatedContributions: Contribution[]) => {
    if (!user) return;
    try {
      if (contributionsObjectId) {
        await updateContributions(contributionsObjectId, updatedContributions, user.sessionToken);
      } else {
        const result = await saveContributions(user.objectId, updatedContributions, user.sessionToken);
        setContributionsObjectId(result.objectId);
      }
    } catch (err) {
      console.error('保存协作记录失败:', err);
    }
  };

  const selectedMod = useMemo(() => mods.find((m) => m.id === selectedModId), [mods, selectedModId]);

  const handleReassignItem = async (itemId: string, newCategoryId: string) => {
    if (!selectedMod) return;
    setStatus('分类中…');
    try {
      let updatedMods: ModMeta[] = [];
      let updatedContributions: Contribution[] = [];

      // 直接在本地更新数据，不依赖 modService 的内部存储
      setMods((prevMods) => {
        updatedMods = prevMods.map((mod) => {
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
        return updatedMods;
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
      setContributions((prev) => {
        updatedContributions = [newContribution, ...prev];
        return updatedContributions;
      });

      // 保存到云端
      await Promise.all([
        saveModsToCloud(updatedMods),
        saveContributionsToCloud(updatedContributions)
      ]);
      
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
      
      let updatedMods: ModMeta[] = [];
      setMods((prevMods) => {
        updatedMods = prevMods.map((mod) => {
          if (mod.id !== selectedMod.id) return mod;
          return {
            ...mod,
            categories: [...mod.categories, { id: categoryId, name, description: '' }]
          };
        });
        return updatedMods;
      });

      // 保存到云端
      saveModsToCloud(updatedMods);
      
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
      let updatedMods: ModMeta[] = [];
      setMods((prevMods) => {
        updatedMods = prevMods.map((mod) => {
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
        return updatedMods;
      });

      // 保存到云端
      saveModsToCloud(updatedMods);
      
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
      let updatedMods: ModMeta[] = [];
      setMods((prevMods) => {
        updatedMods = prevMods.map((mod) => {
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
        return updatedMods;
      });

      // 保存到云端
      saveModsToCloud(updatedMods);
      
      setStatus('排序已更新');
      setTimeout(() => setStatus(''), 1500);
    } catch (err) {
      console.error(err);
      setStatus('排序失败');
    }
  };

  const handleUpdateAchievementNodes = (nodes: AchievementNode[]) => {
    if (!selectedMod) return;
    let updatedMods: ModMeta[] = [];
    setMods((prevMods) => {
      updatedMods = prevMods.map((mod) => {
        if (mod.id !== selectedMod.id) return mod;
        return {
          ...mod,
          achievementGraph: {
            modId: mod.id,
            nodes
          }
        };
      });
      return updatedMods;
    });

    // 保存到云端
    saveModsToCloud(updatedMods);

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
        <div style={{ position: 'absolute', right: 12, top: 12 }}>
          <BmobAuth />
        </div>
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

        {editorMode === 'modeling' && (
          <div className="modeling-panel">
            <div className="panel-header">
              <h3>内置建模工具</h3>
              <button 
                className="btn secondary"
                onClick={() => setEditorMode('classification')}
              >
                返回分类编辑
              </button>
            </div>
            <BlockbenchIntegration />
          </div>
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
