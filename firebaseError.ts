export enum OperationType {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  LIST = 'LIST'
}

export function handleFirestoreError(error: any, operation: OperationType, path: string): void {
  console.error(`Firestore error during ${operation} at ${path}:`, error);
  throw error;
}


