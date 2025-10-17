import { IndexedDBError } from '../errors/errors';
import { IDBOptions } from '../types/index';

/**
 * CoreDB
 * 提供更直观的 IndexedDB 使用接口：connect/transaction/getObjectStore/close 等。
 * 兼容旧的 IndexedDBManager 名称以减少迁移成本。
 */
export class CoreDB {
    private db: IDBDatabase | null = null;
    private _activeTransaction: IDBTransaction | null = null;

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

                request.onblocked = () => {
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

    /**
     * 便捷事务方法
     * 当传入单个存储名时，回调接收该存储的对象仓库；当传入多个存储名时，回调接收事务对象。
     */
    async transaction<T = unknown>(storeNames: string | string[], mode: IDBTransactionMode = 'readwrite', fn: (arg: IDBObjectStore | IDBTransaction) => Promise<T> | T): Promise<T> {
        const tx = this.getTransaction(storeNames, mode);
        return new Promise<T>((resolve, reject) => {
            // 单仓库时传递 objectStore，多仓库时传递 transaction
            let arg: IDBObjectStore | IDBTransaction;
            try {
                if (typeof storeNames === 'string') {
                    arg = tx.objectStore(storeNames);
                } else {
                    arg = tx;
                }

                const result = Promise.resolve(fn(arg));
                result.then((val) => {
                    // 等待事务完成后再 resolve，确保写入落盘
                    tx.oncomplete = () => resolve(val);
                    tx.onerror = () => reject(new IndexedDBError('TRANSACTION', '事务执行失败', tx.error || undefined));
                }).catch((err) => {
                    // 主动中止事务并抛错
                    try { tx.abort(); } catch { /* ignore */ }
                    reject(new IndexedDBError('TRANSACTION', `事务回调执行出错: ${(err as Error).message}`, err instanceof Error ? err : undefined));
                });
            } catch (error) {
                reject(new IndexedDBError('TRANSACTION', `创建事务失败: ${(error as Error).message}`, error instanceof Error ? error : undefined));
            }
        });
    }

    /**
     * 获取对象存储（内部会创建 readonly 事务）。
     * 如需写操作，请使用 transaction('store', 'readwrite', fn)。
     */
    getObjectStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
        if (this._activeTransaction) {
            return this._activeTransaction.objectStore(storeName);
        }
        const tx = this.getTransaction(storeName, mode);
        return tx.objectStore(storeName);
    }

    /** 关闭数据库连接 */
    close(): void {
        if (this.db) {
            try { this.db.close(); } catch { /* ignore */ }
            this.db = null;
        }
    }

    /** 是否已连接 */
    isConnected(): boolean {
        return !!this.db;
    }

    /** 设置当前活动事务，供装饰器在方法体中复用同一事务 */
    setActiveTransaction(tx: IDBTransaction): void {
        this._activeTransaction = tx;
    }

    /** 清除当前活动事务 */
    clearActiveTransaction(): void {
        this._activeTransaction = null;
    }
}

// 兼容旧类名导出
export { CoreDB as IndexedDBManager };