// Type definitions for typed-idb 1.0.2
// Project: https://github.com/yourusername/typed-idb
// Definitions by: Your Name <https://github.com/yourusername>

/**
 * 数据库模式定义
 */
export interface DBSchema {
    name: string;
    keyPath: string | string[];
    indexes?: Array<{
        name: string;
        keyPath: string | string[];
        options?: IDBIndexParameters;
    }>;
}

/**
 * 数据库迁移定义
 */
export interface Migration {
    version: number;
    upgrade: (db: IDBDatabase, transaction: IDBTransaction) => void;
}

/**
 * IndexedDB选项定义
 */
export interface IDBOptions {
    name: string;
    version?: number;
    migrations?: Migration[];
}

/**
 * 查询操作符定义
 */
export interface QueryOperators<T> {
    $eq?: T;
    $ne?: T;
    $gt?: T;
    $gte?: T;
    $lt?: T;
    $lte?: T;
    $in?: T[];
    $nin?: T[];
}

/**
 * 查询条件定义
 */
export type QueryCondition<T> = {
    [K in keyof T]?: T[K] | IDBKeyRange | QueryOperators<T[K]>;
};

/**
 * 可记录类型
 */
export type Recordable<T = unknown> = Record<string, T>;

/**
 * 存储库类型
 */
export interface RepositoryType<T extends Recordable<string>> {
    add(item: T): Promise<IDBValidKey>;
    delete(key: IDBValidKey): Promise<void>;
    get(key: IDBValidKey | IDBKeyRange): Promise<T | undefined>;
    query(condition?: QueryCondition<T>, indexName?: string): Promise<T[]>;
    update(key: IDBValidKey, updates: Partial<T>): Promise<void>;
}

/**
 * IndexedDB错误类型
 */
export type IndexedDBErrorType = 'CONNECTION' | 'TRANSACTION' | 'QUERY' | 'SCHEMA' | 'VALIDATION';

/**
 * IndexedDB错误类
 */
export class IndexedDBError extends Error {
    constructor(
        public type: IndexedDBErrorType,
        message: string,
        public originalError?: Error
    );
    
    /**
     * 获取完整的错误信息，包括原始错误（如果有）
     */
    getFullMessage(): string;
}

/**
 * IndexedDB管理类
 */
export class IndexedDBManager {
    /**
     * 构造函数，接受数据库选项
     * @param options 数据库选项
     */
    constructor(options: IDBOptions);
    
    /**
     * 连接到数据库并处理版本升级
     * @returns {Promise<IDBDatabase>} 数据库实例
     */
    connect(): Promise<IDBDatabase>;
    
    /**
     * 获取事务
     * @param storeNames 存储名称
     * @param mode 事务模式
     * @returns {IDBTransaction} 事务实例
     */
    getTransaction(storeNames: string | string[], mode?: IDBTransactionMode): IDBTransaction;
}

/**
 * 存储操作类
 */
export class Repository<T extends Recordable<string>> {
    /**
     * 构造函数，接受数据库管理实例和存储名称
     * @param dbManager 数据库管理实例
     * @param storeName 存储名称
     */
    constructor(dbManager: IndexedDBManager, storeName: string);
    
    /**
     * 添加数据到存储
     * @param item 要添加的数据项
     * @returns {Promise<IDBValidKey>} 添加操作的结果
     */
    add(item: T): Promise<IDBValidKey>;
    
    /**
     * 获取存储中的数据
     * @param key 数据的键
     * @returns {Promise<T | undefined>} 获取的数据项
     */
    get(key: IDBValidKey | IDBKeyRange): Promise<T | undefined>;
    
    /**
     * 根据条件查询数据
     * @param condition 查询条件
     * @param indexName 索引名称
     * @returns {Promise<T[]>} 查询结果
     */
    query(condition?: QueryCondition<T>, indexName?: string): Promise<T[]>;
    
    /**
     * 更新存储中的数据
     * @param key 数据的键
     * @param updates 更新的数据
     * @returns {Promise<void>} 更新操作的结果
     */
    update(key: IDBValidKey, updates: Partial<T>): Promise<void>;
    
    /**
     * 删除存储中的数据
     * @param key 数据的键
     * @returns {Promise<void>} 删除操作的结果
     */
    delete(key: IDBValidKey): Promise<void>;
}

/**
 * 事务处理装饰器接口
 */
export interface WithDBManager {
    dbManager: {
        getTransaction: (storeNames: string | string[], mode: IDBTransactionMode) => IDBTransaction;
    };
}

/**
 * 事务处理装饰器
 * @param storeNames - 存储名称，可以是单个存储或多个存储的数组
 * @param mode - 事务模式，默认为 'readwrite'
 */
export function transaction<T extends WithDBManager>(
    storeNames: string | string[], 
    mode?: IDBTransactionMode
): MethodDecorator;

/**
 * 执行事务操作
 * @param operation - 要在事务中执行的操作
 */
export function performTransaction(operation: () => void): void;

/**
 * 初始化数据库
 * @param options - 数据库配置
 * @returns Promise 包含数据库管理器实例
 */
export function initDB(options: IDBOptions): Promise<IndexedDBManager>;

/**
 * 创建存储库实例
 * @template T - 实体类型
 * @param dbManager - 数据库管理器
 * @param storeName - 存储名称
 * @returns Repository 实例
 */
export function createRepository<T extends Recordable<string>>(
    dbManager: IndexedDBManager,
    storeName: string
): RepositoryType<T>;