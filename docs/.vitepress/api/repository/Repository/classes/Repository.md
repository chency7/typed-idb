[**typed-idb v1.0.0**](../../../README.md)

***

[typed-idb](../../../modules.md) / [repository/Repository](../README.md) / Repository

# Class: Repository\<T\>

Defined in: repository/Repository.ts:8

存储操作类

## Type Parameters

• **T** *extends* `Record`\<`string`, `any`\>

## Constructors

### new Repository()

> **new Repository**\<`T`\>(`dbManager`, `storeName`): [`Repository`](Repository.md)\<`T`\>

Defined in: repository/Repository.ts:14

构造函数，接受数据库管理实例和存储名称

#### Parameters

##### dbManager

[`IndexedDBManager`](../../../core/CoreDB/classes/IndexedDBManager.md)

数据库管理实例

##### storeName

`string`

存储名称

#### Returns

[`Repository`](Repository.md)\<`T`\>

## Methods

### add()

> **add**(`item`): `Promise`\<`IDBValidKey`\>

Defined in: repository/Repository.ts:21

添加数据到存储

#### Parameters

##### item

`T`

要添加的数据项

#### Returns

`Promise`\<`IDBValidKey`\>

添加操作的结果

***

### delete()

> **delete**(`key`): `Promise`\<`void`\>

Defined in: repository/Repository.ts:106

删除存储中的数据

#### Parameters

##### key

`IDBValidKey`

数据的键

#### Returns

`Promise`\<`void`\>

删除操作的结果

***

### get()

> **get**(`key`): `Promise`\<`undefined` \| `T`\>

Defined in: repository/Repository.ts:37

获取存储中的数据

#### Parameters

##### key

数据的键

`IDBKeyRange` | `IDBValidKey`

#### Returns

`Promise`\<`undefined` \| `T`\>

获取的数据项

***

### query()

> **query**(`condition`?, `indexName`?): `Promise`\<`T`[]\>

Defined in: repository/Repository.ts:54

根据条件查询数据

#### Parameters

##### condition?

[`QueryCondition`](../../../types/types/type-aliases/QueryCondition.md)\<`T`\>

查询条件

##### indexName?

`string`

索引名称

#### Returns

`Promise`\<`T`[]\>

查询结果

***

### update()

> **update**(`key`, `updates`): `Promise`\<`void`\>

Defined in: repository/Repository.ts:90

更新存储中的数据

#### Parameters

##### key

`IDBValidKey`

数据的键

##### updates

`Partial`\<`T`\>

更新的数据

#### Returns

`Promise`\<`void`\>

更新操作的结果
