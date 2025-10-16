/**
 * 事务处理装饰器
 * 
 * @param storeNames - 存储名称，可以是单个存储或多个存储的数组。
 * @param mode - 事务模式，默认为 'readwrite'。
 * @returns - 返回一个装饰器函数，用于包装目标方法。
 * 
 * 使用示例：
 * 
 * class UserService {
 *   @transaction(['users', 'logs'])
 *   async createUser(user: User) {
 *     // 在此方法中执行的所有数据库操作将自动在一个事务中进行。
 *   }
 * }
 */

interface HasTransactionProvider {
    dbManager?: { getTransaction: (storeNames: string | string[], mode: IDBTransactionMode) => IDBTransaction };
    db?: { getTransaction: (storeNames: string | string[], mode: IDBTransactionMode) => IDBTransaction };
}

export function transaction(storeNames: string | string[], mode: IDBTransactionMode = 'readwrite') {
    return function (target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) {
        const originalMethod = descriptor.value;
        if (!originalMethod) return descriptor;

        descriptor.value = async function (this: HasTransactionProvider, ...args: any[]) {
            const provider = this.dbManager ?? this.db;
            if (!provider || typeof provider.getTransaction !== 'function') {
                throw new Error('未找到 getTransaction 提供者，请在类中声明 db 或 dbManager 属性');
            }

            const tx = provider.getTransaction(storeNames, mode);
            return new Promise<any>((resolve, reject) => {
                try {
                    // 设置活动事务，方法内部的 db.getObjectStore 将复用同一事务
                    if (typeof (provider as any).setActiveTransaction === 'function') {
                        (provider as any).setActiveTransaction(tx);
                    }
                    const maybePromise = originalMethod.apply(this, args);
                    Promise.resolve(maybePromise).then((val) => {
                        if (typeof (provider as any).clearActiveTransaction === 'function') {
                            (provider as any).clearActiveTransaction();
                        }
                        tx.oncomplete = () => resolve(val);
                        tx.onerror = () => reject(tx.error || new Error('事务执行失败'));
                    }).catch((err) => {
                        try { tx.abort(); } catch { /* ignore */ }
                        if (typeof (provider as any).clearActiveTransaction === 'function') {
                            (provider as any).clearActiveTransaction();
                        }
                        reject(err);
                    });
                } catch (err) {
                    try { tx.abort(); } catch { /* ignore */ }
                    if (typeof (provider as any).clearActiveTransaction === 'function') {
                        (provider as any).clearActiveTransaction();
                    }
                    reject(err);
                }
            });
        };

        return descriptor;
    };
}


// 定义 performTransaction 函数
export function performTransaction(operation: () => void) {
    operation();
}