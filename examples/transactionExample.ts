// @ts-ignore 
import { CoreDB, transaction } from 'typed-idb';

interface User { id: number; name: string; }

class UserService {
    constructor(public db: CoreDB) { }

    // 在方法体内使用 db.getObjectStore，将复用同一事务
    @transaction('users', 'readwrite')
    async createUser(user: User) {
        const store = this.db.getObjectStore('users');
        await store.add(user);
    }

    // 多仓库事务时，内部通过事务获取多个仓库
    @transaction(['users', 'logs'], 'readwrite')
    async createUserWithLog(user: User) {
        const users = this.db.getObjectStore('users', 'readwrite');
        const logs = this.db.getObjectStore('logs', 'readwrite');
        await users.add(user);
        await logs.add({ id: user.id, message: `Created ${user.name}` });
    }
}

// 使用示例（需要在浏览器环境运行）
async function demo() {
    const db = new CoreDB({
        name: 'demo', version: 1, migrations: [{
            version: 1, upgrade: (db: IDBDatabase, t: IDBTransaction) => {
                const users = db.createObjectStore('users', { keyPath: 'id' });
                db.createObjectStore('logs', { keyPath: 'id' });
                users.createIndex('name', 'name');
            }
        }]
    });
    await db.connect();
    const service = new UserService(db);
    await service.createUser({ id: 1, name: 'Alice' });
}

// demo();