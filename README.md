# 口腔义齿加工与返修协同平台

## 项目简介

本平台是一套面向口腔门诊和义齿加工厂的协同管理系统，支持医生、前台、加工厂技师、质检员和物流人员多角色协作。核心特性是**每颗义齿拥有独立的工序流程和返修履历**，避免多颗义齿分批到货时出现漏试戴、漏收费或错发等问题。

## 技术栈

- **前端**：Vue 3 + Vite + Element Plus + Pinia + Vue Router + Axios
- **后端**：NestJS + TypeORM + SQLite + JWT + Swagger
- **部署**：Docker + Docker Compose + Nginx

## 核心功能

### 角色权限
| 角色 | 功能 |
|------|------|
| 医生 (doctor) | 患者管理、提交订单、提交试戴反馈、申请返修 |
| 前台 (receptionist) | 患者管理、创建订单、物流操作 |
| 技师 (technician) | 模型设计、蜡型、铸造、瓷层、上釉、改色加工、处理返修 |
| 质检员 (inspector) | 边缘密合、颜色、强度、咬合质检 |
| 物流 (logistics) | 发货、签收、退回记录 |

### 业务流程
1. 医生/前台创建患者 → 创建订单（含多颗牙齿信息）
2. 每颗牙齿独立流转：模型设计 → 蜡型 → 铸造 → 瓷层 → 上釉 → 改色 → 质检
3. 质检员检查：边缘、颜色、强度、咬合 → 通过或返工
4. 物流发货/签收，可单颗独立发货
5. 门诊试戴，单颗提交反馈，发现问题可单颗申请返修
6. 返修牙齿独立记录，完成后重新进入加工/质检流程

## 原始需求

> 请实现口腔义齿加工与返修协同平台，Vue3 门诊端给医生、前台、加工厂技师、质检员和物流人员使用，NestJS 后端保存患者牙位、咬合关系、比色照片、口扫文件、材料选择、设计方案、蜡型、铸造、瓷层、质检、发货和返修记录。医生提交订单和试戴反馈；技师处理模型设计、材料加工和改色；质检员检查边缘、颜色、强度和咬合；物流记录发货、签收和退回。这个产品要让每颗牙都有独立工序和返修履历，门诊不能只按患者整单看状态，否则多颗义齿分批到货时很容易漏试戴、漏收费或错发。

## 启动方式

### 前置要求

- Node.js 18+
- npm 9+ 或 pnpm
- Docker 20+（使用 Docker 启动时需要）
- Docker Compose 2+（使用 Docker 启动时需要）

---

### 方式一：Docker 一键启动（推荐）

#### 1. 构建并启动服务

在项目根目录（`wl-343`）执行：

```bash
docker compose up --build
```

如需后台运行：

```bash
docker compose up --build -d
```

#### 2. 访问地址

- 前端门诊端：http://localhost:3000
- 后端 API：http://localhost:3001/api
- API 文档 (Swagger)：http://localhost:3001/api/docs

#### 3. 停止和清理

```bash
docker compose down
```

如需同时删除数据卷：

```bash
docker compose down -v
```

---

### 方式二：本地开发启动

#### 1. 启动后端服务

```bash
cd backend
npm install
npm run start:dev
```

后端默认运行在 http://localhost:3001

#### 2. 启动前端服务

另开一个终端：

```bash
cd frontend
npm install
npm run dev
```

前端默认运行在 http://localhost:3000，已配置代理转发 `/api` 和 `/uploads` 到后端。

#### 3. 访问地址

- 前端：http://localhost:3000
- API 文档：http://localhost:3001/api/docs

---

## 测试账号

系统启动后默认已创建以下测试账号：

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 医生 |
| doctor1 | doctor123 | 医生 |
| reception1 | reception123 | 前台 |
| tech1 | tech123 | 技师 |
| inspector1 | inspector123 | 质检员 |
| logistics1 | logistics123 | 物流 |

---

## 目录结构

```
wl-343/
├── backend/                    # NestJS 后端
│   ├── src/
│   │   ├── common/             # 公共守卫、装饰器
│   │   ├── config/             # 配置文件
│   │   ├── modules/            # 业务模块
│   │   │   ├── auth/           # 认证模块
│   │   │   ├── user/           # 用户模块
│   │   │   ├── patient/        # 患者模块
│   │   │   ├── order/          # 订单模块
│   │   │   ├── tooth/          # 牙齿（单颗独立工序）
│   │   │   ├── process-record/ # 工序记录
│   │   │   ├── inspection/     # 质检
│   │   │   ├── repair/         # 返修
│   │   │   ├── logistics/      # 物流
│   │   │   └── file/           # 文件上传
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # Vue3 前端
│   ├── src/
│   │   ├── api/                # API 请求封装
│   │   ├── router/             # 路由配置
│   │   ├── store/              # Pinia 状态管理
│   │   ├── utils/              # 工具函数
│   │   ├── views/              # 页面组件
│   │   │   ├── Login.vue       # 登录页
│   │   │   ├── Layout.vue      # 布局框架
│   │   │   ├── Dashboard.vue   # 工作台
│   │   │   ├── Patients.vue    # 患者管理
│   │   │   ├── Orders.vue      # 订单管理
│   │   │   ├── OrderDetail.vue # 订单详情
│   │   │   ├── Teeth.vue       # 牙齿工序追踪
│   │   │   ├── ToothDetail.vue # 牙齿详情/工序/返修履历
│   │   │   ├── Technician.vue  # 技师工作台
│   │   │   ├── Inspection.vue  # 质检工作台
│   │   │   ├── Logistics.vue   # 物流管理
│   │   │   └── Repairs.vue     # 返修管理
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   ├── nginx.conf              # Nginx 配置
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── vite.config.js
│   └── package.json
├── Dockerfile                  # 根目录（说明用）
├── .dockerignore
├── docker-compose.yml          # 一键编排
└── README.md
```

## 注意事项

- 数据库默认使用 SQLite，数据文件存储在 `backend/data/dental-lab.db`。Docker 启动时使用数据卷持久化。
- 上传文件存储在 `backend/uploads/` 目录，Docker 启动时使用数据卷持久化。
- 每颗牙齿拥有独立的 `status`、`currentStage`、`processRecords`、`inspections`、`repairs`、`logistics` 记录，可独立追踪和操作。
- JWT Token 有效期为 24 小时，存储在浏览器 localStorage 中。
