以下是一个规范的 TypeScript IndexedDB 操作库设计方案，包含核心模块划分、类型定义和 API 设计：

---

### 一、项目目标

1. 提供类型安全的 IndexedDB 操作接口
2. 简化数据库版本管理、对象存储操作
3. 支持事务操作和复杂查询
4. 良好的错误处理机制
5. 浏览器兼容性支持

---

### 二、项目结构

```
/src          # 源代码目录
  ├── types.ts         # 类型定义
  ├── CoreDB.ts        # 核心数据库管理类
  ├── Repository.ts    # 存储操作类
  ├── Errors.ts        # 错误处理类
  └── index.ts         # 入口文件

/dist         # 构建输出目录
/examples     # 示例代码目录
/docs         # 文档目录
/tests        # 测试目录
```

### 三、核心模块设计

#### 1. 类型定义 (types.ts)

```typescript
type DBSchema = {
  name: string;
  keyPath: string | string[];
  indexes?: Array<{
    name: string;
    keyPath: string | string[];
    options?: IDBIndexParameters;
  }>;
};

type Migration = {
  version: number;
  upgrade: (db: IDBDatabase, transaction: IDBTransaction) => void;
};

interface IDBOptions {
  name: string;
  version?: number;
  migrations?: Migration[];
}

type QueryCondition<T> = {
  [K in keyof T]?: T[K] | IDBKeyRange;
};
```

#### 2. 核心类 (CoreDB.ts)

```typescript
class IndexedDBManager {
  private db: IDBDatabase | null = null;

  constructor(private options: IDBOptions) {}

  async connect(): Promise<IDBDatabase> {
    // 处理数据库连接和版本升级
  }

  getTransaction(
    storeNames: string | string[],
    mode: IDBTransactionMode = "readonly"
  ): IDBTransaction {
    // 事务管理
  }

  // 其他基础方法...
}
```

#### 3. 存储操作类 (Repository.ts)

```typescript
class Repository<T extends Record<string, any>> {
  constructor(private dbManager: IndexedDBManager, private storeName: string) {}

  async add(item: T): Promise<IDBValidKey> {
    // 添加数据
  }

  async get(key: IDBValidKey | IDBKeyRange): Promise<T | undefined> {
    // 获取单条数据
  }

  async query(condition?: QueryCondition<T>, indexName?: string): Promise<T[]> {
    // 条件查询
  }

  async update(key: IDBValidKey, updates: Partial<T>): Promise<void> {
    // 更新数据
  }

  async delete(key: IDBValidKey): Promise<void> {
    // 删除数据
  }
}
```

#### 4. 错误处理 (Errors.ts)

```typescript
class IndexedDBError extends Error {
  constructor(
    public type: "CONNECTION" | "TRANSACTION" | "QUERY" | "SCHEMA",
    message: string
  ) {
    super(message);
  }
}
```

---

### 四、核心功能设计

#### 1. 数据库初始化

```typescript
interface InitDBParams {
  name: string
  version: number
  stores: DBSchema[]
  onUpgrade?: (db: IDBDatabase) => void
}

const initDB = async (params: InitDBParams): Promise<IndexedDBManager>
```

#### 2. 事务处理装饰器

```typescript
function transaction(
  storeNames: string | string[],
  mode: IDBTransactionMode = "readwrite"
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // 实现事务包装逻辑
  };
}
```

#### 3. 高级查询功能

- 支持索引查询
- 范围查询 (IDBKeyRange)
- 分页查询
- 计数查询

---

### 五、使用示例

#### 1. 初始化数据库

```typescript
const dbManager = await initDB({
  name: "myDatabase",
  version: 2,
  stores: [
    {
      name: "users",
      keyPath: "id",
      indexes: [{ name: "email", keyPath: "email", options: { unique: true } }],
    },
  ],
});
```

#### 2. 基本操作

```typescript
const userRepo = new Repository<User>(dbManager, "users");

// 添加用户
await userRepo.add({
  id: 1,
  name: "Alice",
  email: "alice@example.com",
});

// 查询用户
const user = await userRepo.get(1);
const users = await userRepo.query({ age: IDBKeyRange.lowerBound(18) });
```

#### 3. 事务操作

```typescript
class UserService {
  @transaction(["users", "logs"])
  async createUser(user: User) {
    // 多存储操作将自动使用事务
  }
}
```

---

### 六、扩展功能建议

1. 数据加密支持
2. 缓存策略集成
3. 批量操作优化
4. 数据变更监听（基于 EventEmitter）
5. 性能监控插件

---

### 七、开发规范

1. 代码风格：

   - 严格 TypeScript 类型检查
   - ESLint + Prettier
   - 单元测试覆盖率 > 90%

2. 打包输出：
   - 提供 ESM、CJS 双格式
   - 生成类型定义文件
   - 浏览器直接使用版本 (UMD)

---

### 八、技术栈建议

1. 测试框架：Jest + @testing-library/indexeddb
2. 构建工具：Rollup
3. 文档工具：TypeDoc + VitePress
4. 兼容性：core-js 做 polyfill

---

这个方案提供了完整的类型安全支持，同时封装了 IndexedDB 的复杂性。

### 功能模块

1. **类型定义**：定义数据库模式、迁移和查询条件的类型。
2. **核心类**：实现数据库连接和事务管理。
3. **存储操作类**：提供对数据的增、删、改、查操作。
4. **错误处理**：定义自定义错误类。
5. **核心功能**：实现数据库初始化、事务处理和高级查询功能。
