import { transaction } from '../src/decorators/transaction';

class UserService {
    dbManager: { getTransaction: (storeNames: string | string[], mode: IDBTransactionMode) => IDBTransaction };

    constructor() {
        // 初始化dbManager
        this.dbManager = {
            getTransaction: (storeNames, mode) => {
                // 模拟获取事务的逻辑
                return {} as IDBTransaction;
            }
        };
    }

    @transaction(['users', 'logs'], 'readwrite')
    async createUser(user: { id: number; name: string }) {
        // 在此方法中执行的所有数据库操作将自动在一个事务中进行。
        console.log(`Creating user: ${user.name}`);
        // 这里可以添加数据库操作代码
    }
}

// 使用示例
const userService = new UserService();
userService.createUser({ id: 1, name: 'Alice' }); 