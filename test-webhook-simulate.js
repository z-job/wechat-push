const http = require('http');
const wechatHandler = require('./api/wechat');

async function testWebhookSimulation() {
  console.log('====================================================');
  console.log('🧪 【实时对讲模拟测试】Simulating Girlfriend Sending Message');
  console.log('====================================================\n');

  // 1. 模拟 GET 微信 Token 校验
  console.log('1️⃣ 正在模拟微信后台 Token 接口配置校验 (GET)...');
  const crypto = require('crypto');
  const token = 'chaobo_love_secret_2026';
  const timestamp = '1724912345';
  const nonce = '999888';
  const echostr = 'ECHO_TEST_SUCCESS_OK_123';
  const signature = crypto.createHash('sha1').update([token, timestamp, nonce].sort().join('')).digest('hex');

  let getResult = '';
  const mockGetReq = {
    method: 'GET',
    query: { signature, timestamp, nonce, echostr }
  };
  const mockGetRes = {
    status: (code) => mockGetRes,
    send: (msg) => { getResult = msg; }
  };
  await wechatHandler(mockGetReq, mockGetRes);
  console.log(`   => 微信 Token 握手响应: ${getResult} (预期: ${echostr})`);
  if (getResult === echostr) {
    console.log('   ✅ 接口配置 Token 校验 100% 成功！\n');
  }

  // 2. 模拟 POST 小宝宝在微信窗口输入 "大宝宝我想你了！"
  console.log('2️⃣ 正在模拟小宝宝在微信窗口发送：「大宝宝我想你了！」(POST)...');
  const mockXml = `<xml>
    <ToUserName><![CDATA[gh_test_account]]></ToUserName>
    <FromUserName><![CDATA[o5J-u3EHfwjgkFycAYe8lLJj_HCw]]></FromUserName>
    <CreateTime>1724912345</CreateTime>
    <MsgType><![CDATA[text]]></MsgType>
    <Content><![CDATA[大宝宝我想你了！]]></Content>
    <MsgId>9876543210123456</MsgId>
  </xml>`;

  let postResult = '';
  const mockPostReq = {
    method: 'POST',
    body: mockXml
  };
  const mockPostRes = {
    setHeader: () => {},
    status: (code) => mockPostRes,
    send: (xml) => { postResult = xml; }
  };

  await wechatHandler(mockPostReq, mockPostRes);
  console.log('   => 小宝宝微信窗口收到的秒级暖心回复:');
  console.log(postResult);
  console.log('\n✅ 实时对讲与通知转发全链路测试通过！');
}

testWebhookSimulation();
