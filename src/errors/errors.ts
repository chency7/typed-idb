/**
 * IndexedDB错误类型
 */
export type IndexedDBErrorType =
    | 'CONNECTION'    // 数据库连接错误
    | 'TRANSACTION'   // 事务操作错误
    | 'QUERY'         // 查询执行错误
    | 'SCHEMA'        // 数据库模式错误
    | 'VALIDATION'    // 数据验证错误
    | 'VERSION';      // 新增：版本控制错误

// 更精确的 Func 类型定义
type Constructor = new (...args: unknown[]) => unknown;
type FunctionType = (...args: unknown[]) => unknown;
type Func = FunctionType | Constructor;

/**
 * IndexedDB错误类
 * 提供更详细的错误信息和错误类型，支持错误链和堆栈追踪优化
 */
export class IndexedDBError extends Error {
    /**
     * 错误发生的时间戳
     */
    public readonly timestamp: Date;

    /**
     * 错误唯一标识
     */
    public readonly id: string;

    /**
     * 构造函数
     * @param type 错误类型
     * @param message 错误消息
     * @param originalError 原始错误对象（可选）
     */
    constructor(
        public readonly type: IndexedDBErrorType,
        message: string,
        public readonly originalError?: Error
    ) {
        // 增强错误消息，包含类型信息
        const enhancedMessage = `[IndexedDB:${type}] ${message}`;
        super(enhancedMessage);

        this.name = 'IndexedDBError';
        this.timestamp = new Date();
        this.id = this.generateErrorId();

        // 优化堆栈跟踪处理
        this.optimizeStackTrace();

        // 保持原型链
        Object.setPrototypeOf(this, IndexedDBError.prototype);
    }

    /**
     * 生成错误唯一ID
     */
    private generateErrorId(): string {
        if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
            return `idb-${crypto.randomUUID()}`;
        }
        return `idb-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }
    /**
     * 优化堆栈跟踪显示
     */
    private optimizeStackTrace(): void {
        // 检查是否支持 captureStackTrace
        const capture = Error?.captureStackTrace as
            ((targetObject: object, constructorOpt?: Func) => void) | undefined;

        if (typeof capture === 'function') {
            // 使用 V8 的堆栈捕获优化
            capture(this, IndexedDBError as Func);
        } else {
            // 降级方案：创建标准错误对象获取堆栈
            try {
                const err = new Error(this.message);
                this.stack = err.stack;
            } catch {
                // 如果上述方法失败，使用基本堆栈
                this.stack = new Error().stack;
            }
        }
    }

    /**
     * 获取完整的错误信息，包括原始错误（如果有）
     */
    getFullMessage(): string {
        let fullMessage = `${this.name}: ${this.message}`;

        if (this.originalError) {
            fullMessage += `\n原始错误: ${this.originalError.message}`;

            // 如果是 IndexedDB 特定错误，添加更多上下文
            if (this.originalError.name.includes('Error')) {
                fullMessage += ` (${this.originalError.name})`;
            }
        }

        return fullMessage;
    }

    /**
     * 获取错误的 JSON 表示，便于序列化和日志记录
     */
    toJSON(): object {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            message: this.message,
            timestamp: this.timestamp.toISOString(),
            originalError: this.originalError ? {
                name: this.originalError.name,
                message: this.originalError.message,
                stack: this.originalError.stack
            } : undefined,
            stack: this.stack
        };
    }

    /**
     * 静态方法：创建特定类型的错误
     */
    static connectionError(message: string, originalError?: Error): IndexedDBError {
        return new IndexedDBError('CONNECTION', message, originalError);
    }

    static transactionError(message: string, originalError?: Error): IndexedDBError {
        return new IndexedDBError('TRANSACTION', message, originalError);
    }

    static queryError(message: string, originalError?: Error): IndexedDBError {
        return new IndexedDBError('QUERY', message, originalError);
    }

    /**
     * 检查错误是否为特定类型
     */
    isType(type: IndexedDBErrorType): boolean {
        return this.type === type;
    }

    /**
     * 获取错误严重等级
     */
    getSeverity(): 'low' | 'medium' | 'high' {
        const severityMap: Record<IndexedDBErrorType, 'low' | 'medium' | 'high'> = {
            'CONNECTION': 'high',
            'TRANSACTION': 'high',
            'QUERY': 'medium',
            'SCHEMA': 'high',
            'VALIDATION': 'medium',
            'VERSION': 'medium'
        };

        return severityMap[this.type] || 'medium';
    }
}

// 类型守卫函数，便于在 catch 块中使用
export function isIndexedDBError(error: unknown): error is IndexedDBError {
    return error instanceof IndexedDBError;
}