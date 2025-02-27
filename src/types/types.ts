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
 * 查询条件定义
 */
export type QueryCondition<T> = {
    [K in keyof T]?: T[K] | IDBKeyRange;
}; 