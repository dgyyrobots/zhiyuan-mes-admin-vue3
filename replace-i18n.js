const fs = require('fs');
const path = require('path');

// 从现有的国际化文件中提取映射配置
const i18nMappings = {
  // 总经理看板相关 - 使用实际的国际化key
  '总经理看板': 'dashboard.generalManager.title',
  '年品牌完成率': 'dashboard.generalManager.brandCompletion',
  '目标完成情况': 'dashboard.generalManager.productionTargets',
  '月度生产统计': 'dashboard.generalManager.monthlyProduction',
  '月度销售统计': 'dashboard.generalManager.monthlySales',
  '紧急工单跟踪': 'dashboard.generalManager.emergencyOrders',
  
  // 工单详情
  '客户': 'dashboard.generalManager.customer',
  '交货日期': 'dashboard.generalManager.deliveryDate',
  '任务数量': 'dashboard.generalManager.taskCount',
  '完成率': 'dashboard.generalManager.completionRate',
  '工单号': 'dashboard.generalManager.orderNo',
  
  // 品牌完成表格
  '品牌名称': 'dashboard.generalManager.brandName',
  '目标': 'dashboard.generalManager.target',
  '配套烟箱': 'dashboard.generalManager.supportingBoxes',
  
  // 生产目标
  '年度目标': 'dashboard.generalManager.yearTarget',
  '月度目标': 'dashboard.generalManager.monthTarget',
  '年度质量目标': 'dashboard.generalManager.yearQualityTarget',
  '年度完成数量': 'dashboard.generalManager.yearCompleted',
  '月度完成数量': 'dashboard.generalManager.monthCompleted',
  '实际合格率': 'dashboard.generalManager.actualQualityRate',
  '年度完成率': 'dashboard.generalManager.yearCompletionRate',
  '月度完成率': 'dashboard.generalManager.monthCompletionRate',
  
  // 图表相关
  '实际': 'dashboard.generalManager.actualValue',
  '完成比例': 'dashboard.generalManager.completionRatio',
  '月': 'dashboard.generalManager.month',
  '数量 (万箱)': 'dashboard.generalManager.quantity',
  '比例': 'dashboard.generalManager.ratio',
  
  // 通用状态
  '暂无数据': 'dashboard.generalManager.noData',
  '加载中': 'dashboard.generalManager.loading',
  '刷新': 'dashboard.generalManager.refresh',
  '全屏': 'dashboard.generalManager.fullscreen',
  '退出全屏': 'dashboard.generalManager.exitFullscreen'
};

// 需要处理的文件路径 - 仅限general文件夹
const filesToProcess = [
  // 'src/views/screen/general/index.vue',
  // 'src/views/screen/general/components/EmergencyOrderTracker.vue',
  // 'src/views/screen/general/components/BrandCompletionTable.vue',
  // 'src/views/screen/general/components/MonthlySalesChart.vue',
  'src/views/screen/general/components/MonthlyProductionChart.vue',
  // 'src/views/screen/general/components/ProductionTargets.vue'
];

/**
 * 转义正则表达式特殊字符
 * @param {string} string 需要转义的字符串
 * @returns {string} 转义后的字符串
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 替换文件中template部分的中文文本为国际化函数调用
 * @param {string} filePath 文件路径
 */
function replaceI18nInFile(filePath) {
  const fullPath = path.resolve(filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`文件不存在: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let hasChanges = false;
  
  // 提取template部分
  const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/);
  if (!templateMatch) {
    console.log(`⏭️  文件中没有找到template标签: ${filePath}`);
    return;
  }
  
  let templateContent = templateMatch[1];
  const originalTemplateContent = templateContent;
  
  // 遍历所有映射，在template中进行替换
  Object.entries(i18nMappings).forEach(([chineseText, i18nKey]) => {
    // 检查是否已经是国际化调用
    if (templateContent.includes(`$t('${i18nKey}')`) || templateContent.includes(`t('${i18nKey}')`)) {
      return;
    }
    
    // 创建正则表达式来匹配中文文本
    const escapedText = escapeRegExp(chineseText);
    
    // 匹配标签之间的文本 >中文<
    const tagPattern = new RegExp(`(>[^<]*?)${escapedText}([^<]*?<)`, 'g');
    const newTemplateContent = templateContent.replace(tagPattern, (match, before, after) => {
      // 检查是否已经包含国际化调用
      if (match.includes('$t(') || match.includes('t(')) {
        return match;
      }
      hasChanges = true;
      return `${before}{{ $t('${i18nKey}') }}${after}`;
    });
    
    templateContent = newTemplateContent;
    
    // 匹配属性值中的中文 ="中文"
    const attrPattern = new RegExp(`(=["'])${escapedText}(["'])`, 'g');
    const newTemplateContent2 = templateContent.replace(attrPattern, (match, before, after) => {
      if (match.includes('$t(') || match.includes('t(')) {
        return match;
      }
      hasChanges = true;
      return `${before}{{ $t('${i18nKey}') }}${after}`;
    });
    
    templateContent = newTemplateContent2;
  });
  
  // 如果template有变化，替换原文件中的template部分
  if (hasChanges) {
    const newContent = content.replace(
      /<template[^>]*>[\s\S]*?<\/template>/,
      `<template>${templateContent}</template>`
    );
    
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`✅ 已更新template部分: ${filePath}`);
  } else {
    console.log(`⏭️  template无需更新: ${filePath}`);
  }
}

/**
 * 批量处理所有文件
 */
function processAllFiles() {
  console.log('🚀 开始批量处理general文件夹中template的国际化文本替换...');
  console.log('='.repeat(60));
  
  filesToProcess.forEach(filePath => {
    replaceI18nInFile(filePath);
  });
  
  console.log('='.repeat(60));
  console.log('✨ 批量处理完成！');
  console.log('\n📝 注意事项:');
  console.log('1. 脚本仅处理了 <template> 标签内的中文文本');
  console.log('2. <script> 标签内的内容保持不变');
  console.log('3. 使用的国际化key来自 src/locales 文件夹中的配置');
  console.log('4. 请检查替换结果并测试功能是否正常');
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
使用方法:
  node replace-i18n.js              # 批量替换general文件夹中template的中文文本
  node replace-i18n.js --help        # 显示帮助信息

功能说明:
  - 仅处理 src/views/screen/general 文件夹中的 Vue 文件
  - 只替换 <template> 标签内的中文文本
  - 不修改 <script> 标签内的内容
  - 使用 src/locales 文件夹中已有的国际化配置
`);
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    showHelp();
  } else {
    processAllFiles();
  }
}

// 运行脚本  node replace-i18n.js
main();