# typed-idb 🗄️

> 一个类型安全的 IndexedDB 操作库，支持 Web Workers 和可视化分析。

<p align="center">
  <img src="./logo.svg" width="200" height="200" alt="typed-idb logo">
</p>

## 特性 ✨

- ✅ 完整的 TypeScript 类型支持
- 🎯 简洁的 API 设计
- 🔄 Web Worker 支持
- 🔒 事务装饰器
- 📊 可视化分析工具

## 安装 📦

```bash
npm install typed-idb
# 或
yarn add typed-idb
# 或
pnpm add typed-idb
```

## 使用示例 💡

### 基本用法 🚀

```typescript
import { CoreDB } from "typed-idb";

interface User {
  id: number;
  name: string;
  email: string;
}

// 定义数据库结构
const db = new CoreDB({
  name: "myApp",
  version: 1,
  migrations: [
    {
      version: 1,
      upgrade: (db) => {
        const store = db.createObjectStore("users", { keyPath: "id" });
        store.createIndex("email", "email", { unique: true });
      },
    },
  ],
});

// 添加用户
await db.transaction("users", "readwrite", async (store) => {
  await store.add({
    id: 1,
    name: "John Doe",
    email: "john@example.com",
  });
});

// 查询用户
const user = await db.transaction("users", "readonly", async (store) => {
  return store.get(1);
});
```

### 使用事务装饰器 🔒

```typescript
import { transaction } from "typed-idb";

class UserService {
  constructor(private db: CoreDB) {}

  @transaction("users", "readwrite")
  async createUser(user: User) {
    const store = this.db.getObjectStore("users");
    await store.add(user);
  }

  @transaction("users", "readonly")
  async getUserByEmail(email: string) {
    const store = this.db.getObjectStore("users");
    const index = store.index("email");
    return index.get(email);
  }
}
```

### Web Worker 集成 🔄

```typescript
// worker.ts
import { CoreDB } from "typed-idb";
import * as Comlink from "comlink";

const db = new CoreDB({
  name: "myApp",
  version: 1,
  // ... 数据库配置
});

const api = {
  async getUser(id: number) {
    return db.transaction("users", "readonly", async (store) => {
      return store.get(id);
    });
  },
};

Comlink.expose(api);

// main.ts
import * as Comlink from "comlink";

const worker = new Worker(new URL("./worker.ts", import.meta.url));
const api = Comlink.wrap(worker);

// 在主线程中调用 Worker
const user = await api.getUser(1);
```

## 文档 📚

详细文档请访问：[typed-idb 文档](https://github.com/chency7/typed-idb)

## 许可证 📄

MIT
