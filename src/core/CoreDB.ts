import { IndexedDBError } from '../errors/errors';
import { IDBOptions } from '../types/index';

/**
 * IndexedDB管理类
 */
export class IndexedDBManager {
    private db: IDBDatabase | null = null;

    /**
     * 构造函数，接受数据库选项
     * @param options 数据库选项
     */
    constructor(private options: IDBOptions) { }

    /**
     * 连接到数据库并处理版本升级
     * @returns {Promise<IDBDatabase>} 数据库实例
     */
    async connect(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open(this.options.name, this.options.version);

                request.onupgradeneeded = (event) => {
                    try {
                        const db = (event.target as IDBOpenDBRequest).result;
                        const transaction = (event.target as IDBOpenDBRequest).transaction;
                        const oldVersion = event.oldVersion;

                        if (transaction) {
                            this.options.migrations?.sort((a, b) => a.version - b.version).forEach(migration => {
                                if (migration.version > oldVersion) {
                                    migration.upgrade(db, transaction);
                                }
                            });
                        }
                    } catch (error) {
                        console.error('数据库升级过程中发生错误:', error);
                        reject(new IndexedDBError('SCHEMA', `数据库升级失败: ${(error as Error).message}`));
                    }
                };

                request.onsuccess = (event) => {
                    this.db = (event.target as IDBOpenDBRequest).result;

                    // 添加数据库关闭事件处理
                    this.db.onclose = () => {
                        this.db = null;
                        console.log('数据库连接已关闭');
                    };

                    // 添加数据库错误事件处理
                    this.db.onerror = (event) => {
                        console.error('数据库操作错误:', event.target);
                    };

                    resolve(this.db);
                };

                request.onerror = (event) => {
                    const error = (event.target as IDBOpenDBRequest).error;
                    reject(new IndexedDBError('CONNECTION', `数据库连接失败: ${error?.message || '未知错误'}`));
                };

                request.onblocked = (event) => {
                    reject(new IndexedDBError('CONNECTION', '数据库连接被阻塞，可能有其他标签页正在使用此数据库'));
                };
            } catch (error) {
                reject(new IndexedDBError('CONNECTION', `初始化数据库连接失败: ${(error as Error).message}`));
            }
        });
    }


    /**
     * 获取事务
     * @param storeNames 存储名称
     * @param mode 事务模式
     * @returns {IDBTransaction} 事务实例
     */
    getTransaction(storeNames: string | string[], mode: IDBTransactionMode = 'readonly'): IDBTransaction {
        if (!this.db) throw new Error('数据库未连接');
        return this.db.transaction(storeNames, mode);
    }

}