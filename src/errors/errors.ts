/**
 * IndexedDB错误类型
 */
export type IndexedDBErrorType = 'CONNECTION' | 'TRANSACTION' | 'QUERY' | 'SCHEMA' | 'VALIDATION';

/**
 * IndexedDB错误类
 * 提供更详细的错误信息和错误类型
 */
export class IndexedDBError extends Error {
    /**
     * 构造函数
     * @param type 错误类型
     * @param message 错误消息
     * @param originalError 原始错误对象（可选）
     */
    constructor(
        public type: IndexedDBErrorType,
        message: string,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'IndexedDBError';
        
        // 确保堆栈跟踪正确显示
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, IndexedDBError);
        }
    }

    /**
     * 获取完整的错误信息，包括原始错误（如果有）
     */
    getFullMessage(): string {
        if (this.originalError) {
            return `${this.message} (原始错误: ${this.originalError.message})`;
        }
        return this.message;
    }
}
