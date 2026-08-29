const http = require('http');
const url = require('url');
const wechatHandler = require('./api/wechat');

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  req.query = parsedUrl.query;

  // 包装 res.status 和 res.send 辅助方法
  res.status = function(code) {
    res.statusCode = code;
    return res;
  };
  res.send = function(data) {
    res.end(data);
    return res;
  };

  if (parsedUrl.pathname === '/api/wechat' || parsedUrl.pathname === '/wechat' || parsedUrl.pathname === '/') {
    await wechatHandler(req, res);
  } else {
    res.status(404).send('Not Found');
  }
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🌸 微信消息实时接收与对讲中继服务已启动！监听端口: ${PORT}`);
  console.log(`📡 微信接口回调路径: http://localhost:${PORT}/api/wechat`);
  console.log('====================================================');
});
