export class IndexedDBError extends Error {
    constructor(
        public type: 'CONNECTION' | 'TRANSACTION' | 'QUERY' | 'SCHEMA',
        message: string
    ) {
        super(message);
    }
}
