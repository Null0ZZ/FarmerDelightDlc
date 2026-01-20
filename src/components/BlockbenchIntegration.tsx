import React, { useState } from 'react';

const BlockbenchIntegration: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="blockbench-container">
      <h2>内置建模工具 (Blockbench)</h2>
      <div className="blockbench-iframe-wrapper">
        {!isLoaded && <div className="loading">正在加载Blockbench...</div>}
        <iframe
          src="https://web.blockbench.net/"
          style={{ width: '100%', height: '100%' }}
          frameBorder="0"
          onLoad={() => setIsLoaded(true)}
          title="Blockbench Web Editor"
          allowFullScreen
        />
      </div>
      <div className="blockbench-info">
        <p>💡 使用说明：</p>
        <ul>
          <li>Blockbench是专业的Minecraft模型编辑器</li>
          <li>支持创建方块模型、实体模型等</li>
          <li>可以导出为Minecraft兼容格式</li>
          <li>创建的模型可以直接用于你的模组</li>
        </ul>
      </div>
    </div>
  );
};

export default BlockbenchIntegration;