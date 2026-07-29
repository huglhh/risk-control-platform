FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package.json .
RUN npm install --production

# 复制项目文件
COPY server.js .
COPY public ./public

# 暴露端口（CloudBase 会自动注入 PORT 环境变量）
EXPOSE 3000

# 启动服务
CMD ["node", "server.js"]
