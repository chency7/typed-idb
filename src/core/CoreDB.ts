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
        // 处理数据库连接和版本升级
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.options.name, this.options.version);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                const transaction = (event.target as IDBOpenDBRequest).transaction;
                if (transaction) {
                    this.options.migrations?.forEach((migration) => {
                        if (migration.version === db.version) {
                            migration.upgrade(db, transaction);
                        }
                    });
                }
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve(this.db);
            };

            request.onerror = () => {
                reject(new IndexedDBError('CONNECTION', '数据库连接失败'));
            };
        });
    }

    /**
     * 处理数据库升级
     * @param db - 数据库实例
     * @param oldVersion - 旧版本号
     * @param transaction - 事务对象
     */
    private handleUpgrade(
        db: IDBDatabase,
        oldVersion: number,
        transaction: IDBTransaction
    ): void {
        this.options.migrations?.forEach(migration => {
            if (migration.version > oldVersion) {
                migration.upgrade(db, transaction);
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