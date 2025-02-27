[**typed-idb v1.0.0**](../../../README.md)

***

[typed-idb](../../../modules.md) / [core/CoreDB](../README.md) / IndexedDBManager

# Class: IndexedDBManager

Defined in: core/CoreDB.ts:7

IndexedDB管理类

## Constructors

### new IndexedDBManager()

> **new IndexedDBManager**(`options`): [`IndexedDBManager`](IndexedDBManager.md)

Defined in: core/CoreDB.ts:14

构造函数，接受数据库选项

#### Parameters

##### options

[`IDBOptions`](../../../types/types/interfaces/IDBOptions.md)

数据库选项

#### Returns

[`IndexedDBManager`](IndexedDBManager.md)

## Methods

### connect()

> **connect**(): `Promise`\<`IDBDatabase`\>

Defined in: core/CoreDB.ts:20

连接到数据库并处理版本升级

#### Returns

`Promise`\<`IDBDatabase`\>

数据库实例

***

### getTransaction()

> **getTransaction**(`storeNames`, `mode`): `IDBTransaction`

Defined in: core/CoreDB.ts:54

获取事务

#### Parameters

##### storeNames

存储名称

`string` | `string`[]

##### mode

`IDBTransactionMode` = `'readonly'`

事务模式

#### Returns

`IDBTransaction`

事务实例
