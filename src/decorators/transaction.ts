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

interface WithDBManager {
    dbManager: {
        getTransaction: (storeNames: string | string[], mode: IDBTransactionMode) => IDBTransaction;
    };
}

export function transaction(storeNames: string | string[], mode: IDBTransactionMode = 'readwrite') {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (this: { dbManager: any }, ...args: any[]) {
            const dbManager = this.dbManager;
            const transaction = dbManager.getTransaction(storeNames, mode);
            const result = await originalMethod.apply(this, [transaction, ...args]);
            return result;
        };
    };
}


// 定义 performTransaction 函数
export function performTransaction(operation: () => void) {
    // 事务逻辑...
    operation();
}