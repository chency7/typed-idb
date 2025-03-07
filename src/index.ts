import { IndexedDBManager } from './core/CoreDB';
import { Repository } from './repository/Repository';
import { IDBOptions, DBSchema, Recordable, RepositoryType } from './types/index';

/**
 * 初始化数据库
 * @param options - 数据库配置
 * @returns Promise 包含数据库管理器实例
 */
export async function initDB(options: IDBOptions): Promise<IndexedDBManager> {
    const dbManager = new IndexedDBManager(options);
    await dbManager.connect();
    return dbManager;
}


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
): RepositoryType<T> {
    return new Repository<T>(dbManager, storeName);
}


export type { DBSchema, IDBOptions };

