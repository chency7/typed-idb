import { CoreDB } from './core/CoreDB';
import { Repository } from './repository/Repository';
import { IDBOptions, DBSchema, RepositoryType } from './types/index';
export { transaction } from './decorators/transaction';

/**
 * 初始化数据库
 * @param options - 数据库配置
 * @returns Promise 包含数据库管理器实例
 */
export async function initDB(options: IDBOptions): Promise<CoreDB> {
    const db = new CoreDB(options);
    await db.connect();
    return db;
}


/**
 * 创建存储库实例
 * @template T - 实体类型
 * @param dbManager - 数据库管理器
 * @param storeName - 存储名称
 * @returns Repository 实例
 */

export function createRepository<T extends Record<string, unknown>>(
    dbManager: CoreDB,
    storeName: string
): RepositoryType<T> {
    return new Repository<T>(dbManager, storeName);
}


export type { DBSchema, IDBOptions };
export { CoreDB };

