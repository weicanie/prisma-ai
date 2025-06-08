ARG NODE_VERSION=22.11.0
ARG PNPM_VERSION=9.15.4

FROM docker.1ms.run/library/node:${NODE_VERSION}-alpine AS builder

# 设置生产环境
# ENV NODE_ENV=production

# 安装pnpm
RUN npm install -g pnpm@${PNPM_VERSION}

# 设置工作目录（容器内部）
WORKDIR /app

#COPY 电脑文件系统 容器文件系统
# 复制整个monorepo的package.json和pnpm配置文件
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml* ./

# 复制所有packages的package.json以便正确安装依赖
COPY ./packages/backend/package.json ./packages/backend/
COPY ./packages/shared/package.json ./packages/shared/

# 首先安装所有依赖
RUN pnpm install --frozen-lockfile

# 复制后端项目和共享包目录下所有文件（.dockerignore中忽略的文件不会被复制）
COPY ./packages/backend ./packages/backend
COPY ./packages/shared ./packages/shared

# 首先构建共享包
RUN pnpm --filter @prism-ai/shared build

# 生成 Prisma 客户端（为了成功build）
RUN pnpm --filter backend exec prisma generate --no-engine

# 然后构建后端包
RUN pnpm --filter backend build

# 第二阶段：构建生产镜像
FROM docker.1ms.run/library/node:${NODE_VERSION}-alpine

# 保持生产环境设置
# ENV NODE_ENV=production

WORKDIR /app

# 安装生产环境需要的pnpm
RUN npm install -g pnpm@${PNPM_VERSION}

# 从构建阶段的镜像中复制package.json和lock文件
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml* ./
COPY --from=builder /app/packages/backend/package.json ./packages/backend/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

# 只安装生产依赖（忽略生命周期scripts,比如prepare触发husky, 否则会报错因为husky是开发依赖此阶段不安装）
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# 从构建阶段复制编译后的代码
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# 复制其他需要的资源文件
# schema.prisma
COPY --from=builder /app/packages/backend/prisma ./packages/backend/prisma
# prompts
COPY --from=builder /app/packages/backend/ai_data ./packages/backend/ai_data

# 在生产环境中生成完整的Prisma客户端
RUN pnpm --filter backend exec prisma generate

# 切换到非root用户
USER node

# 设置工作目录到后端项目文件夹
WORKDIR /app/packages/backend

# 暴露后端服务端口
EXPOSE 3303

# 启动服务
CMD ["node", "dist/main.js"]