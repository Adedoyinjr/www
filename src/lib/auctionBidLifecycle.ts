import { TransactionRejectedError } from '@/lib/stellar/transactionOutcome';
import type { SubmittedTransaction } from '@/lib/stellar/transactionOutcome';

export type BidSubmissionStatus = 'pending' | 'committed' | 'retryable' | 'ambiguous';

export interface BidSubmissionOutcome {
  status: BidSubmissionStatus;
  hash?: string;
  error?: string;
}

export interface PlaceBidOptions {
  build: () => Promise<string>;
  sign: (xdr: string) => Promise<string>;
  broadcast: (signedXdr: string) => Promise<SubmittedTransaction>;
  persistRecovery: () => Promise<void>;
  discardRecovery: () => Promise<void>;
}

export interface PlaceBidResult extends BidSubmissionOutcome {
  recoveryRetained: boolean;
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return fallback;
}

async function discard(
  options: PlaceBidOptions,
  outcome: BidSubmissionOutcome,
): Promise<PlaceBidResult> {
  try {
    await options.discardRecovery();
    return { ...outcome, recoveryRetained: false };
  } catch {
    return { ...outcome, recoveryRetained: true };
  }
}

export async function placeBid(options: PlaceBidOptions): Promise<PlaceBidResult> {
  await options.persistRecovery();

  let xdr: string;
  try {
    xdr = await options.build();
  } catch (error) {
    return await discard(options, {
      status: 'retryable',
      error: errorMessage(error, 'Failed to build the bid transaction.'),
    });
  }

  let signedXdr: string;
  try {
    signedXdr = await options.sign(xdr);
  } catch (error) {
    return await discard(options, {
      status: 'retryable',
      error: errorMessage(error, 'The wallet did not sign the bid.'),
    });
  }

  try {
    const result = await options.broadcast(signedXdr);
    return { status: result.status, hash: result.hash, recoveryRetained: true };
  } catch (error) {
    if (error instanceof TransactionRejectedError) {
      return await discard(options, {
        status: 'retryable',
        error: errorMessage(error, 'The network rejected the bid.'),
      });
    }
    return {
      status: 'ambiguous',
      error: errorMessage(error, 'The network did not confirm the bid.'),
      recoveryRetained: true,
    };
  }
}
