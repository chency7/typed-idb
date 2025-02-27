[**typed-idb v1.0.0**](../../../README.md)

***

[typed-idb](../../../modules.md) / [errors/errors](../README.md) / IndexedDBError

# Class: IndexedDBError

Defined in: errors/errors.ts:1

## Extends

- `Error`

## Constructors

### new IndexedDBError()

> **new IndexedDBError**(`type`, `message`): [`IndexedDBError`](IndexedDBError.md)

Defined in: errors/errors.ts:2

#### Parameters

##### type

`"CONNECTION"` | `"TRANSACTION"` | `"QUERY"` | `"SCHEMA"`

##### message

`string`

#### Returns

[`IndexedDBError`](IndexedDBError.md)

#### Overrides

`Error.constructor`

## Properties

### type

> **type**: `"CONNECTION"` \| `"TRANSACTION"` \| `"QUERY"` \| `"SCHEMA"`

Defined in: errors/errors.ts:3
