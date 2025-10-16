# typed-idb 🗄️

> 一个类型安全的 IndexedDB 操作库，提供简洁的事务 API 与仓库模式。

<p align="center">
  <img src="./logo.svg" width="200" height="200" alt="typed-idb logo">
</p>

## 特性 ✨

- ✅ 完整的 TypeScript 类型支持
- 🎯 简洁的 API 设计
- 🔒 事务 API（CoreDB.transaction）
- 🧩 仓库模式（Repository）

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

### 使用仓库模式 🧩

```typescript
import { initDB, createRepository } from "typed-idb";

const db = await initDB({ name: "myApp", version: 1 });
const userRepo = createRepository<User>(db, "users");

await userRepo.add({ id: 1, name: "John", email: "john@example.com" });
const user = await userRepo.get(1);
const adults = await userRepo.query({ age: { $gte: 18 } }, "age");
```

### 使用事务装饰器 🔒

```typescript
import { CoreDB, transaction } from "typed-idb";

class UserService {
  constructor(public db: CoreDB) {}

  // 装饰器会在方法执行期间绑定同一个事务，
  // 方法体内使用 this.db.getObjectStore('store') 将复用该事务。
  @transaction('users', 'readwrite')
  async createUser(user: User) {
    const store = this.db.getObjectStore('users');
    await store.add(user);
  }

  // 多仓库事务：同样无需改变方法签名
  @transaction(['users', 'logs'], 'readwrite')
  async createUserWithLog(user: User) {
    const users = this.db.getObjectStore('users');
    const logs = this.db.getObjectStore('logs');
    await users.add(user);
    await logs.add({ id: user.id, message: `Created ${user.name}` });
  }
}
```

## 文档 📚

详细文档请访问：[typed-idb 文档](https://github.com/chency7/typed-idb)

## 许可证 📄

MIT
