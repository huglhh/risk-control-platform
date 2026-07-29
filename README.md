# 项目安全生产风险管控平台 - 启动说明

## 文件结构
```
risk-platform/
├── server.js          # Express 后端服务器
├── package.json       # 依赖配置
├── public/
│   └── index.html     # 前端页面（含所有业务逻辑）
└── data.json          # 数据存储文件（自动生成）
```

## 本地启动

1. 安装依赖（首次）：
   ```
   cd risk-platform
   npm install
   ```

2. 启动服务器：
   ```
   node server.js
   ```

3. 打开浏览器访问：http://localhost:3000

## 技术架构

- **后端**：Node.js + Express
- **数据存储**：JSON 文件（data.json，自动生成）
- **前端**：Tailwind CSS + ECharts + XLSX.js
- **API 接口**：
  - GET    /api/data         - 获取全部数据
  - POST   /api/data         - 新增单条数据
  - PUT    /api/data/:id     - 更新单条数据
  - DELETE /api/data/:id     - 删除单条数据
  - POST   /api/data/batch   - 批量导入
  - DELETE /api/data/batch   - 批量删除
  - GET    /api/health       - 健康检查

## 部署到公网

如需公网访问，推荐以下平台（免费额度）：
- Render (https://render.com)
- Railway (https://railway.app)
- Fly.io (https://fly.io)

部署步骤：
1. 将 risk-platform 文件夹上传到 GitHub 仓库
2. 在上述平台创建新项目，连接 GitHub 仓库
3. 设置启动命令为 `node server.js`
4. 平台会自动安装依赖并启动服务
