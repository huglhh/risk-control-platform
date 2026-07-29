# 项目安全生产风险管控平台 - 启动说明

## 文件结构
```
risk-platform/
├── server.js          # Express 后端服务器
├── package.json       # 依赖配置
├── Dockerfile         # 容器部署配置（CloudBase 等）
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

## 部署到腾讯云 CloudBase（推荐，国内直连）

### 前提
- 注册腾讯云账号：https://cloud.tencent.com
- 代码已上传到 GitHub

### 步骤
1. 进入 CloudBase 云托管控制台：https://console.cloud.tencent.com/tcb
2. 创建环境（选择上海/广州地域，国内访问最快）
3. 点击「云托管」→「新建服务」
4. 服务名称填写 risk-platform
5. 代码来源选择「GitHub」，关联 risk-control-platform 仓库
6. 监听端口填 3000
7. 点击「完成」，等待构建（约 2-3 分钟）
8. 构建成功后，在服务详情页点击「访问服务」即可获得公网地址

### 数据持久化（重要）
容器重启后本地文件会丢失，需挂载 CFS 持久卷：
1. 在服务设置中添加「CFS 持久化存储」，挂载路径填 /data
2. 添加环境变量：DATA_DIR=/data
3. 这样 data.json 会保存在持久卷中，重启不丢失

## 部署到其他平台

如需部署到其他平台（Railway/Render/Fly.io），注意这些平台服务器在海外，
国内访问可能需要加速器。步骤：
1. 连接 GitHub 仓库
2. 启动命令设为 node server.js
3. 平台自动安装依赖并启动
