import { useRef } from 'react';
import { ModMeta } from '../types';
import { importModConfig, exportModConfig } from '../api/configService';

type Props = {
  mods: ModMeta[];
  onImport: (newMods: ModMeta[]) => void;
};

export const ConfigManager = ({ mods, onImport }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = importModConfig(text);
        
        if (!result.success) {
          alert(`导入失败: ${result.error}`);
          return;
        }

        onImport(result.data?.mods || []);
        alert('导入成功！');
      } catch (err) {
        alert(`导入失败: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExportJSON = () => {
    const json = exportModConfig(mods);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mods-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      <button 
        className="button primary" 
        onClick={() => fileInputRef.current?.click()}
      >
        📥 导入配置
      </button>
      <button className="button" onClick={handleExportJSON}>
        📤 导出配置
      </button>
    </div>
  );
};
