export const showVersionInfo = () => {
  const version = '1.0.8';
  const buildTime = '2025-08-01 08:30';
  
  // 修复样式输出问题
  console.group('%c 系统信息 ', 'background: linear-gradient(90deg, #409EFF, #409eff); color: white; padding: 4px 12px; border-radius: 6px; font-weight: bold; font-size: 14px;');
  
  // 修复：每个console.log只能有一个%c和对应的样式
  console.log(`%c📦 版本号: ${version}`, 'color: #409EFF; font-weight: bold;');
  
  console.log(`%c🕒 构建时间: ${buildTime}`, 'color: #409EFF; font-weight: normal;');
  
  console.log('%c© 2025 东莞市云燚机器人有限公司 Inc. All Rights Reserved.', 
    'color: #909399; font-style: italic; font-size: 12px; margin-top: 8px;');
  
  console.groupEnd();
};