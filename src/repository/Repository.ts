import { IndexedDBError } from '../errors/errors';
import { IndexedDBManager } from '../core/CoreDB';
import { QueryCondition } from '../types/index';

/**
 * 存储操作类
 */
export class Repository<T extends Record<string, unknown>> {
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
        try {
            const transaction = this.dbManager.getTransaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add(item);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = (event) => {
                    const error = (event.target as IDBRequest).error;
                    reject(new IndexedDBError('QUERY', '添加数据失败', error || undefined));
                };
                transaction.oncomplete = () => {
                    // 事务成功完成但没有结果时
                    if (!request.result) resolve(request.result);
                };
                transaction.onerror = () => {
                    const error = transaction.error;
                    reject(new IndexedDBError('TRANSACTION', '添加事务失败', error || undefined));
                };
            });
        } catch (error) {
            throw new IndexedDBError('QUERY', `添加数据时发生错误: ${(error as Error).message}`, error instanceof Error ? error : undefined);
        }
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
            // 优先使用 IDBKeyRange 打开游标，提升查询效率
            let range: IDBKeyRange | undefined;
            if (condition && indexName && condition[indexName as keyof T] instanceof IDBKeyRange) {
                range = condition[indexName as keyof T] as unknown as IDBKeyRange;
            } else if (condition) {
                const keys = Object.keys(condition);
                if (keys.length === 1) {
                    const onlyKey = keys[0];
                    const val = (condition as Record<string, unknown>)[onlyKey];
                    if (val instanceof IDBKeyRange) range = val;
                }
            }

            const request = indexName ? store.index(indexName).openCursor(range) : store.openCursor(range);

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor) {
                    const value = cursor.value;
                    if (condition) {
                        const match = Object.entries(condition).every(([key, conditionValue]) => {
                            if (conditionValue instanceof IDBKeyRange) {
                                const fieldValue = value[key];
                                return conditionValue.includes(fieldValue);
                            } else if (typeof conditionValue === 'object' && conditionValue !== null) {
                                const { $gt, $gte, $lt, $lte, $eq, $ne, $in, $nin } = conditionValue;
                                const fieldValue = value[key];

                                if ($eq !== undefined) return fieldValue === $eq;
                                if ($ne !== undefined) return fieldValue !== $ne;
                                if ($gt !== undefined && fieldValue <= $gt) return false;
                                if ($gte !== undefined && fieldValue < $gte) return false;
                                if ($lt !== undefined && fieldValue >= $lt) return false;
                                if ($lte !== undefined && fieldValue > $lte) return false;
                                if ($in !== undefined) return Array.isArray($in) && $in.includes(fieldValue);
                                if ($nin !== undefined) return Array.isArray($nin) && !$nin.includes(fieldValue);

                                return true;
                            }
                            return value[key] === conditionValue;
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
        try {
            const transaction = this.dbManager.getTransaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);

            // 先获取原有数据
            const existingData = await this.get(key);
            if (!existingData) {
                throw new IndexedDBError('QUERY', '要更新的数据不存在');
            }

            // 合并更新数据
            const updatedData = { ...existingData, ...updates };
            const request = store.put(updatedData);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve();
                request.onerror = (event) => {
                    const error = (event.target as IDBRequest).error;
                    reject(new IndexedDBError('QUERY', '更新数据失败', error || undefined));
                };

                // 添加事务完成和错误处理
                transaction.oncomplete = () => {
                    // 事务成功完成
                    if (!request.result) resolve();
                };

                transaction.onerror = () => {
                    const error = transaction.error;
                    reject(new IndexedDBError('TRANSACTION', '更新事务失败', error || undefined));
                };
            });
        } catch (error) {
            throw new IndexedDBError('QUERY', `更新数据时发生错误: ${(error as Error).message}`, error instanceof Error ? error : undefined);
        }
    }

    /**
     * 删除存储中的数据
     * @param key 数据的键
     * @returns {Promise<void>} 删除操作的结果
     */
    async delete(key: IDBValidKey): Promise<void> {
        try {
            const transaction = this.dbManager.getTransaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(key);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve();
                request.onerror = (event) => {
                    const error = (event.target as IDBRequest).error;
                    reject(new IndexedDBError('QUERY', '删除数据失败', error || undefined));
                };

                transaction.oncomplete = () => {
                    // 事务成功完成
                    if (!request.result) resolve();
                };

                transaction.onerror = () => {
                    const error = transaction.error;
                    reject(new IndexedDBError('TRANSACTION', '删除事务失败', error || undefined));
                };
            });
        } catch (error) {
            throw new IndexedDBError('QUERY', `删除数据时发生错误: ${(error as Error).message}`, error instanceof Error ? error : undefined);
        }
    }

}