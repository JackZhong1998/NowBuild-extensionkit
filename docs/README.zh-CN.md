# NowBuild Extension Kit（浏览器插件脚手架）

这是一个 **MIT 开源** 的 **Chrome Manifest V3** 插件脚手架，集成了：

- **Clerk** 登录（`@clerk/chrome-extension`）
- **Supabase** 数据存储（通过轻量 **Node API/BFF**；**service role** 只留在服务端）
- **Stripe** 支付（服务端创建 Checkout Session；也支持在插件里打开 **Payment Link**）
- 自带弹窗 UI：**主页**、**账户**、以及一个可扩展的 **用户管理（管理员）** 页面

**GitHub：** [github.com/JackZhong1998/NowBuild-extensionkit](https://github.com/JackZhong1998/NowBuild-extensionkit)

English docs: [`README.md`](../README.md)

## 为什么一定要有服务端（BFF）？

浏览器插件**不能**安全地内置：

- Supabase 的 **service role key**
- Stripe 的 **secret key**

因此本仓库把敏感密钥放在 `server/`，只暴露少量接口：

- `GET /api/me`：校验 Clerk session，并在 Supabase `profiles` 表做 upsert
- `GET /api/admin/users`：拉取 Clerk 用户列表（仅允许 `ADMIN_USER_IDS` 白名单）
- `POST /api/stripe/checkout`：创建 Stripe Checkout Session

你也可以把 `server/` 换成 Cloudflare Workers / FastAPI / 任意后端，只要保持同样的 API 契约，就能继续复用插件端代码。

## 目录结构

```
├── src/                 # 插件源码（Vite + React + CRXJS）
├── server/              # Node + Hono API（本地开发/易部署）
├── supabase/migrations/ # `profiles` 表 SQL
├── sync-host/           # Clerk sync host 的静态站说明/模板
├── docs/                # 中文文档（本文件）
└── dist/                # 构建产物（`npm run build` 后）
```

## 快速开始

### 1）安装依赖

```bash
npm install
cd server && npm install && cd ..
```

### 2）配置 Supabase

创建项目，执行 `supabase/migrations/0001_profiles.sql`，然后准备：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`（**仅服务端**）

### 3）配置 Clerk + sync host

`@clerk/chrome-extension` 需要 HTTPS 的 **sync host**。把 `sync-host/public/`（或 Clerk 官方推荐模板）部署到一个域名，并配置：

- `VITE_CLERK_SYNC_HOST`（插件）
- `VITE_CLERK_PUBLISHABLE_KEY`（插件）
- `CLERK_SECRET_KEY`（服务端）

同时要在 Clerk 控制台把 sync host 域名加入允许的来源/回调配置（以 Clerk 当前文档为准）。

### 4）配置 Stripe（可选）

服务端：

- `STRIPE_SECRET_KEY`

插件（可选）：

- `VITE_STRIPE_PRICE_ID`：启用示例 **付款**按钮（服务端创建 Checkout Session）
- 或 `VITE_STRIPE_PAYMENT_LINK_URL`：直接打开 Stripe Payment Link

另外建议配置 `VITE_PUBLIC_APP_URL` 作为 Stripe 的 `success_url` / `cancel_url`落地页（生产环境请用 **HTTPS**）。

### 5）本地运行

终端 A（API）：

```bash
cd server
cp .env.example .env
# 填写环境变量
npm run dev
```

终端 B（插件）：

```bash
cp .env.example .env
# 填写环境变量
npm run dev
```

在 Chrome 加载未打包扩展（`dist/`）：

1. 打开 `chrome://extensions`
2. 打开 **开发者模式**
3. **加载已解压的扩展程序** → 选择 `dist/`

### 6）用户管理（管理员）

在服务端设置：

- `ADMIN_USER_IDS=user_...,user_...`

只有这些 Clerk user id 才能通过 **Users** 页面调用 `GET /api/admin/users`。

## 安全提示（上线前必读）

- 不要提交 `.env`。
- **永远不要把** Supabase service role / Stripe secret **写进插件包**。
- `ADMIN_USER_IDS` 适合脚手架演示；真实产品建议把角色/权限落到数据库，并结合 Clerk Organization 等在服务端做鉴权。

## 常用命令

- `npm run dev`：插件开发构建
- `npm run build`：插件生产构建输出到 `dist/`
- `cd server && npm run dev`：默认在本机 `8787` 启动 API

## 许可证

MIT — 见 [`LICENSE`](../LICENSE)。
