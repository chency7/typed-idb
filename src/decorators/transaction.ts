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
    dbManager?: TransactionProvider;
    db?: TransactionProvider;
}

export function transaction<TArgs extends unknown[], TResult = unknown>(storeNames: string | string[], mode: IDBTransactionMode = 'readwrite') {
    return function (target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<(...args: TArgs) => Promise<TResult> | TResult>) {
        const originalMethod = descriptor.value;
        if (!originalMethod) return descriptor as TypedPropertyDescriptor<(...args: TArgs) => Promise<TResult>>;

        descriptor.value = async function (this: HasTransactionProvider, ...args: TArgs): Promise<TResult> {
            const provider: TransactionProvider | undefined = this.dbManager ?? this.db;
            if (!provider || typeof provider.getTransaction !== 'function') {
                throw new Error('未找到 getTransaction 提供者，请在类中声明 db 或 dbManager 属性');
            }

            const tx = provider.getTransaction(storeNames, mode);
            return new Promise<TResult>((resolve, reject) => {
                try {
                    // 设置活动事务，方法内部的 db.getObjectStore 将复用同一事务
                    provider.setActiveTransaction?.(tx);
                    const maybePromise = originalMethod.apply(this, args);
                    Promise.resolve(maybePromise).then((val) => {
                        provider.clearActiveTransaction?.();
                        tx.oncomplete = () => resolve(val as TResult);
                        tx.onerror = () => reject(tx.error || new Error('事务执行失败'));
                    }).catch((err) => {
                        try { tx.abort(); } catch { /* ignore */ }
                        provider.clearActiveTransaction?.();
                        reject(err);
                    });
                } catch (err) {
                    try { tx.abort(); } catch { /* ignore */ }
                    provider.clearActiveTransaction?.();
                    reject(err);
                }
            });
        };

        return descriptor as TypedPropertyDescriptor<(...args: TArgs) => Promise<TResult>>;
    };
}


// 定义 performTransaction 函数
export function performTransaction(operation: () => void) {
    operation();
}

// 更精准的事务提供者类型
type TransactionProvider = {
  getTransaction: (storeNames: string | string[], mode: IDBTransactionMode) => IDBTransaction;
  setActiveTransaction?: (tx: IDBTransaction) => void;
  clearActiveTransaction?: () => void;
};