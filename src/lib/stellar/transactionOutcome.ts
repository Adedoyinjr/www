/**
 * Shared vocabulary for the outcome of a Stellar transaction submission.
 */
export class TransactionRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransactionRejectedError';
  }
}

export type SubmittedTransactionStatus = 'pending' | 'committed';

export interface SubmittedTransaction {
  hash: string;
  status: SubmittedTransactionStatus;
}
