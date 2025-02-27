import { IndexedDBError } from '../errors/errors';
import { IndexedDBManager } from '../core/CoreDB';
import { QueryCondition } from '../types/index';

/**
 * 存储操作类
 */
export class Repository<T extends Record<string, any>> {
    /**
     * 构造函数，接受数据库管理实例和存储名称
     * @param dbManager 数据库管理实例
     * @param storeName 存储名称
     */
    constructor(private dbManager: IndexedDBManager, private storeName: string) { }

    /**
     * 添加数据到存储
     * @param item 要添加的数据项
     * @returns {Promise<IDBValidKey>} 添加操作的结果
     */
    async add(item: T): Promise<IDBValidKey> {
        const transaction = this.dbManager.getTransaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.add(item);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new IndexedDBError('QUERY', '添加数据失败'));
        });
    }

    /**
     * 获取存储中的数据
     * @param key 数据的键
     * @returns {Promise<T | undefined>} 获取的数据项
     */
    async get(key: IDBValidKey | IDBKeyRange): Promise<T | undefined> {
        const transaction = this.dbManager.getTransaction(this.storeName);
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new IndexedDBError('QUERY', '获取数据失败'));
        });
    }

    /**
     * 根据条件查询数据
     * @param condition 查询条件
     * @param indexName 索引名称
     * @returns {Promise<T[]>} 查询结果
     */
    async query(condition?: QueryCondition<T>, indexName?: string): Promise<T[]> {
        const transaction = this.dbManager.getTransaction(this.storeName);
        const store = transaction.objectStore(this.storeName);
        const results: T[] = [];

        return new Promise((resolve, reject) => {
            const request = indexName ? store.index(indexName).openCursor() : store.openCursor();

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor) {
                    const value = cursor.value;
                    if (condition) {
                        const match = Object.keys(condition).every((key) => {
                            return value[key] === condition[key] || condition[key] instanceof IDBKeyRange;
                        });
                        if (match) results.push(value);
                    } else {
                        results.push(value);
                    }
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };

            request.onerror = () => reject(new IndexedDBError('QUERY', '查询数据失败'));
        });
    }

    /**
     * 更新存储中的数据
     * @param key 数据的键
     * @param updates 更新的数据
     * @returns {Promise<void>} 更新操作的结果
     */
    async update(key: IDBValidKey, updates: Partial<T>): Promise<void> {
        const transaction = this.dbManager.getTransaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put({ ...updates, key });

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve();
            request.onerror = () => reject(new IndexedDBError('QUERY', '更新数据失败'));
        });
    }

    /**
     * 删除存储中的数据
     * @param key 数据的键
     * @returns {Promise<void>} 删除操作的结果
     */
    async delete(key: IDBValidKey): Promise<void> {
        const transaction = this.dbManager.getTransaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve();
            request.onerror = () => reject(new IndexedDBError('QUERY', '删除数据失败'));
        });
    }

    // 其他方法...
} 