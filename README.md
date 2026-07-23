<div align="center">
  <img src="./public/favicon.svg" width="120" />
  <h1>SoybeanAdmin</h1>
  <p>基于 Vue 3 的清新优雅、高颜值中后台管理模板（本仓库为定制版）</p>
</div>

---

> 本项目基于 [SoybeanAdmin](https://github.com/soybeanjs/soybean-admin)（v2.2.0）定制，在保留其工程化能力的基础上，新增了**非侵入式接口加密**（验证码 / 登录 AES + RSA）等定制能力。

## 简介

SoybeanAdmin 是一个清新优雅、高颜值且功能强大的后台管理模板，基于最新的前端技术栈构建，包括 **Vue 3、Vite 8、TypeScript、Pinia、UnoCSS、Naive UI**。内置了丰富的主题配置与组件，代码规范严谨，实现了自动化的文件路由系统，并采用基于 Mock 的在线接口方案，开箱即用。

本定制仓库在官方模板之上：

- 新增 `src/utils/cryptox` 加密模块（AES-256 + RSA-OAEP），参考 gin-vue-admin 的加密接口实现；
- 在 `@sa/axios` 请求管线中扩展 `onResponse` 钩子，使「验证码 / 登录」请求与响应可非侵入式加解密；
- 通过环境变量开关控制，默认关闭，对其它接口零影响。

## 技术栈

| 分类     | 技术                                    |
| -------- | --------------------------------------- |
| 框架     | Vue 3.5（`<script setup>` + TSX）       |
| 构建     | Vite 8                                  |
| 语言     | TypeScript 6（严格模式）                |
| 状态管理 | Pinia 3                                 |
| UI 组件  | Naive UI 2.44                           |
| 样式     | UnoCSS 66                               |
| 路由     | Vue Router 5（Elegant Router 自动生成） |
| 请求     | 自研 `@sa/axios`（Axios 封装）          |
| 工具     | VueUse、dayjs、echarts、@iconify/vue    |

## 特性

- **前沿技术栈**：Vue 3 + Vite 8 + TypeScript + Pinia + UnoCSS + Naive UI。
- **清晰的 monorepo 架构**：`packages/` 内聚 `@sa/*` 内部包，结构清晰、可复用。
- **严格的代码规范**：集成 ESLint / Prettier / oxlint / simple-git-hooks，提交前置校验。
- **类型安全**：全量 TypeScript 严格类型检查。
- **主题与国际化**：内置多样主题配置，开箱即用的 i18n 方案。
- **自动化路由**：基于 Elegant Router 自动生成路由导入、声明与类型。
- **灵活的权限路由**：同时支持前端静态路由与后端动态路由（`VITE_AUTH_ROUTE_MODE`）。
- **非侵入式接口加密**：可对指定接口（验证码 / 登录）启用 AES + RSA 加解密，详见[接口加密](#接口加密)。

## 目录结构

```text
soybean-admin/
├── build/                     # 构建相关脚本
├── packages/                  # monorepo 内部包（@sa/*）
│   ├── axios/                 #   请求封装（已扩展 onResponse 钩子）
│   ├── alova/                 #   alova 请求封装
│   ├── color/                 #   颜色工具
│   ├── hooks/                 #   通用组合式函数
│   ├── materials/             #   物料/模板
│   ├── scripts/               #   脚手架与脚本（sa 命令）
│   ├── uno-preset/            #   UnoCSS 预设
│   └── utils/                 #   通用工具
├── public/                    # 静态资源
├── src/
│   ├── assets/                # 资源
│   ├── components/            # 通用组件
│   ├── constants/             # 常量
│   ├── enum/                  # 枚举
│   ├── hooks/                 # 组合式函数
│   ├── layouts/               # 布局
│   ├── locales/               # 国际化
│   ├── plugins/               # 插件
│   ├── router/                # 路由（自动生成）
│   ├── service/               # 接口层
│   │   ├── api/               #   各业务 API（auth 等）
│   │   └── request/           #   请求实例与拦截器
│   ├── store/                 # Pinia 状态
│   ├── styles/                # 全局样式
│   ├── theme/                 # 主题
│   ├── typings/               # 类型声明
│   ├── utils/                 # 工具
│   │   └── cryptox/           #   加密模块（AES/RSA/拦截器）
│   └── views/                 # 页面
├── .env / .env.prod / .env.test
├── vite.config.ts
└── package.json
```

## 环境要求

- **Node.js**: >= 20.19.0（推荐 20.19.0 或更高）
- **pnpm**: >= 10.5.0（推荐 10.5.0 或更高）
- **git**: 用于版本管理

> 本项目采用 pnpm monorepo 管理，**请勿**使用 npm 或 yarn 安装依赖。

## 快速开始

```bash
# 1. 安装依赖
pnpm i

# 2. 启动开发服务器（默认 test 模式）
pnpm dev

# 3. 生产构建
pnpm build          # prod 模式
pnpm build:test     # test 模式
```

开发服务器默认以 `test` 模式运行（`vite --mode test`），环境变量加载顺序为 `.env` → `.env.test`。

## 常用脚本

| 命令              | 说明                                            |
| ----------------- | ----------------------------------------------- |
| `pnpm dev`        | 启动开发服务器（test 模式）                     |
| `pnpm dev:prod`   | 以 prod 模式启动开发服务器                      |
| `pnpm build`      | 生产构建（prod 模式）                           |
| `pnpm build:test` | 构建（test 模式）                               |
| `pnpm preview`    | 预览构建产物                                    |
| `pnpm typecheck`  | `vue-tsc` 类型检查（`--noEmit --skipLibCheck`） |
| `pnpm lint`       | oxlint + eslint 修复                            |
| `pnpm fmt`        | 代码格式化（oxfmt）                             |
| `pnpm commit`     | 生成 Conventional Commits 提交信息              |
| `pnpm gen-route`  | 自动生成路由                                    |
| `pnpm cleanup`    | 清理无效文件                                    |

## 环境变量

项目使用多套环境文件：`.env`（基础，始终加载）、`.env.test`（test 模式）、`.env.prod`（prod 模式）。

核心变量：

| 变量                               | 说明                               | 默认值           |
| ---------------------------------- | ---------------------------------- | ---------------- |
| `VITE_BASE_URL`                    | 应用基础路径                       | `/`              |
| `VITE_APP_TITLE`                   | 应用标题                           | `SoybeanAdmin`   |
| `VITE_AUTH_ROUTE_MODE`             | 权限路由模式：`static` / `dynamic` | `static`         |
| `VITE_ROUTE_HOME`                  | 首页路由名                         | `home`           |
| `VITE_HTTP_PROXY`                  | 是否开启接口代理                   | `Y`              |
| `VITE_SERVICE_SUCCESS_CODE`        | 后端成功状态码                     | `0000`           |
| `VITE_SERVICE_LOGOUT_CODES`        | 登出状态码（逗号分隔）             | `8888,8889`      |
| `VITE_SERVICE_EXPIRED_TOKEN_CODES` | 令牌过期状态码                     | `9999,9998,3333` |
| `VITE_STORAGE_PREFIX`              | 本地存储前缀                       | `SOY_`           |
| `VITE_APP_ENCRYPT`                 | 是否开启接口加密                   | `false`          |
| `VITE_APP_RSA_PUBLIC_KEY`          | 后端 RSA 公钥（单行 base64）       | 空               |

## 接口加密

本项目为「获取验证码」与「登录」接口提供**非侵入式**加解密能力，默认关闭，仅对显式标记的接口生效。

### 加密策略（与 gin-vue-admin 对齐）

- **请求**：前端随机生成 AES-256 key → 用**后端 RSA 公钥**加密该 key，放入 `encrypt-key` 请求头 → 用 AES 加密请求体，封包为 `{ __encrypted__: true, data }`。
- **响应**：后端用同一把 AES key 加密响应体，并在响应头标记 `X-Response-Encrypted: true`；前端用请求时缓存的 AES key 自动解密。
- **非侵入**：仅当请求选项标记 `isEncrypt: true` 且全局开关 `VITE_APP_ENCRYPT=true` 时生效，对其它接口完全透明。

### 已接入的接口

| 函数                  | 方法 | 路径            | 标记              |
| --------------------- | ---- | --------------- | ----------------- |
| `fetchGetCaptcha`     | POST | `/base/captcha` | `isEncrypt: true` |
| `fetchLogin`          | POST | `/auth/login`   | `isEncrypt: true` |
| `fetchLoginByCaptcha` | POST | `/base/login`   | `isEncrypt: true` |

> 业务页面（`captcha-login`、`pwd-login` 及 `authStore`）无需改动，自动走加密通道。短信验证码登录（`code-login`）走另一套短信接口，如需覆盖，给对应 `fetch*` 增加 `isEncrypt: true` 即可。

### 启用步骤

1. **后端开启加密**，并提供 RSA 公钥（PKCS#8 / 标准格式均可）。
2. 将 RSA 公钥转换为**单行 base64**（去除 `-----BEGIN/-----END-----` 头尾与换行），填入 `.env` 的 `VITE_APP_RSA_PUBLIC_KEY`。
3. 将 `VITE_APP_ENCRYPT` 设为 `true`。
4. 后端需保证：
   - 能从 `encrypt-key` 请求头解出 AES key；
   - 用该 key 加密响应体，并在响应头写入 `X-Response-Encrypted: true`；
   - 能解析请求体信封 `{ __encrypted__: true, data }`。

```bash
# .env
VITE_APP_ENCRYPT=true
VITE_APP_RSA_PUBLIC_KEY=MIICIjANBgkqhkiG...（单行 base64）
```

### 涉及文件

- `src/utils/cryptox/aes.ts` —— AES-256-CBC（Web Crypto，base64([IV][密文])）
- `src/utils/cryptox/rsa.ts` —— RSA-OAEP（SHA-256），兼容 PEM / 单行 base64
- `src/utils/cryptox/index.ts` —— `encryptRequestPayload` / `decryptResponsePayload` / `setServerPublicKey`
- `src/utils/cryptox/encrypt-interceptor.ts` —— 与 `@sa/axios` 桥接：`encryptRequest`(onRequest) / `decryptResponse`(onResponse)
- `packages/axios/src/type.ts`、`index.ts` —— 新增 `onResponse` 钩子（在 `isBackendSuccess` 之前执行，使解密先于成功判定）
- `src/service/request/index.ts` —— 在 `onRequest` 中 `await encryptRequest(config)`，并注册 `onResponse` 调用 `decryptResponse`
- `src/service/api/auth.ts` —— `fetchGetCaptcha`、`fetchLogin`、`fetchLoginByCaptcha` 增加 `isEncrypt: true`

## 代码规范与提交

- 提交前会自动执行 `typecheck` + `lint` + `fmt` 校验（simple-git-hooks）。
- 使用 `pnpm commit` 生成符合 [Conventional Commits](https://www.conventionalcommits.org/) 规范的提交信息。
- 自定义 `git-commit-verify` 钩子会校验提交信息格式。

## 浏览器支持

推荐使用最新版 Chrome 进行开发以获得最佳体验。

| Chrome          | Edge            | Firefox         | Safari          |
| --------------- | --------------- | --------------- | --------------- |
| last 2 versions | last 2 versions | last 2 versions | last 2 versions |

## 开源协议

基于 [MIT © 2021 Soybean](./LICENSE) 协议。本项目为定制分支，仅供学习参考，商业使用请保留作者版权信息。
