ARG NODE_VERSION=22.11.0
ARG PNPM_VERSION=9.15.4

FROM node:${NODE_VERSION}-alpine AS builder

# 安装pnpm
RUN npm install -g pnpm@${PNPM_VERSION}

# 设置工作目录（容器内部）
WORKDIR /app

#COPY 电脑文件系统 容器文件系统
# 复制整个monorepo的package.json和pnpm配置文件
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml* ./

# 复制所有packages的package.json以便正确安装依赖
COPY ./packages/backend/package.json ./packages/backend/

# 安装所有依赖, 验证json和lock的依赖一致性、确保lock中的依赖不会被意外更新（不一致立马失败）
RUN pnpm install --frozen-lockfile


# 仅复制后端项目相关代码
COPY ./packages/backend ./packages/backend

# 生成 Prisma 客户端（为了成功build）
WORKDIR /app/packages/backend
RUN npx prisma generate --no-engine

# 构建后端项目
WORKDIR /app/packages/backend
RUN pnpm build

# 第二阶段：构建生产镜像
FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=production

WORKDIR /app

# 安装生产环境需要的pnpm
RUN npm install -g pnpm@${PNPM_VERSION}

# 从构建阶段的镜像中复制package.json和lock文件
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml* ./
COPY --from=builder /app/packages/backend/package.json ./packages/backend/

# 只安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 从构建阶段复制编译后的代码
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
# 复制其他需要的资源文件
# node_modules
COPY --from=builder /app/packages/backend/node_modules ./packages/backend/node_modules
# schema.prisma
COPY --from=builder /app/packages/backend/prisma ./packages/backend/prisma

# 在生产环境中重新生成Prisma客户端
WORKDIR /app/packages/backend
RUN npx prisma generate 

# 切换到非root用户
USER node

# 设置工作目录到后端项目文件夹
WORKDIR /app/packages/backend

# 暴露后端服务端口
EXPOSE 3303

# 启动服务
CMD ["node", "dist/main.js"]