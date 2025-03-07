// types.ts
/**
 * 数据库模式定义
 */
export type DBSchema = {
    name: string;
    keyPath: string | string[];
    indexes?: Array<{
        name: string;
        keyPath: string | string[];
        options?: IDBIndexParameters;
    }>;
};

/**
 * 数据库迁移定义
 */
export type Migration = {
    version: number;
    upgrade: (db: IDBDatabase, transaction: IDBTransaction) => void;
};

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
export type QueryOperators<T> = {
    $eq?: T;
    $ne?: T;
    $gt?: T;
    $gte?: T;
    $lt?: T;
    $lte?: T;
    $in?: T[];
    $nin?: T[];
};

/**
 * 查询条件定义
 */
export type QueryCondition<T> = {
    [K in keyof T]?: T[K] | IDBKeyRange | QueryOperators<T[K]>;
};



export type Recordable<T = unknown> = Record<string, T>;


export type RepositoryType<T extends Recordable<string>> = {
    add(item: T): Promise<IDBValidKey>;
    delete(key: IDBValidKey): Promise<void>;
    get(key: IDBValidKey | IDBKeyRange): Promise<T | undefined>;
    query(condition?: QueryCondition<T>, indexName?: string): Promise<T[]>;
    update(key: IDBValidKey, updates: Partial<T>): Promise<void>;
}