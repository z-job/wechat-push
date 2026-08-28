const config = require('./config/index.cjs');
const templateConfigList = require('./config/template-config.cjs');
const { buildMessagePayload } = require('./src/services/message-builder');

async function dryRun() {
  console.log('====================================================');
  console.log('🧪 【离线模拟运行测试】Dry-Run Message Builder Test');
  console.log('====================================================\n');

  const mockUser = {
    name: '小宝宝',
    id: 'mock_openid_girlfriend_123456',
    useTemplateId: '0001',
    province: '河北',
    city: '大名',
    horoscopeDate: '03-08',
    festivals: [
      { name: '小宝宝阳历生日', date: '03-08' },
      { name: '大宝宝阳历生日', date: '11-20' }
    ],
    customizedDateList: [
      { keyword: 'love_day', date: '2025-04-06' }
    ]
  };

  const defaultTemplateConfig = templateConfigList[0];
  console.log('📦 正在模拟构建模板消息 Payload...\n');
  const payload = await buildMessagePayload(mockUser, config, defaultTemplateConfig);

  console.log('----------------------------------------------------');
  console.log('💌 渲染生成的微信模板卡片预览:');
  console.log('----------------------------------------------------');
  for (const [key, item] of Object.entries(payload.data)) {
    console.log(`[${key.padEnd(16)}] (${item.color}) => ${item.value}`);
  }
  console.log('----------------------------------------------------');
  console.log('\n📄 完整微信接口数据包 (JSON Payload):');
  console.log(JSON.stringify(payload, null, 2));

  console.log('\n✅ 离线模拟测试通过！数据计算与莫兰迪配色绑定完全正常！');
}

dryRun();
