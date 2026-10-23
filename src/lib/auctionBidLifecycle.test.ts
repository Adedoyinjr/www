import { describe, expect, it, vi } from 'vitest';

import { placeBid, type PlaceBidOptions } from './auctionBidLifecycle';
import { TransactionRejectedError } from './stellar/transactionOutcome';

function options(overrides: Partial<PlaceBidOptions> = {}) {
  return {
    build: vi.fn(async () => 'unsigned-xdr'),
    sign: vi.fn(async () => 'signed-xdr'),
    broadcast: vi.fn(async () => ({ hash: 'hash-1', status: 'committed' as const })),
    persistRecovery: vi.fn(async () => {}),
    discardRecovery: vi.fn(async () => {}),
    ...overrides,
  };
}

describe('auction bid lifecycle', () => {
  it('reports a wallet rejection as retryable and drops the recovery record', async () => {
    const deps = options({
      sign: vi.fn(async () => {
        throw new Error('User rejected the request');
      }),
    });

    const result = await placeBid(deps);

    expect(result.status).toBe('retryable');
    expect(result.recoveryRetained).toBe(false);
    expect(result.error).toMatch(/rejected/i);
    expect(deps.broadcast).not.toHaveBeenCalled();
    expect(deps.discardRecovery).toHaveBeenCalledTimes(1);
  });

  it('reports a confirmed pre-broadcast failure as retryable', async () => {
    const deps = options({
      build: vi.fn(async () => {
        throw new Error('simulation failed: insufficient deposit');
      }),
    });

    const result = await placeBid(deps);

    expect(result.status).toBe('retryable');
    expect(result.recoveryRetained).toBe(false);
    expect(result.error).toMatch(/insufficient deposit/);
    expect(deps.sign).not.toHaveBeenCalled();
    expect(deps.broadcast).not.toHaveBeenCalled();
    expect(deps.discardRecovery).toHaveBeenCalledTimes(1);
  });

  it('keeps the recovery record when the broadcast outcome is ambiguous', async () => {
    const deps = options({
      broadcast: vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    });

    const result = await placeBid(deps);

    expect(result.status).toBe('ambiguous');
    expect(result.recoveryRetained).toBe(true);
    expect(result.error).toMatch(/failed to fetch/i);
    expect(deps.discardRecovery).not.toHaveBeenCalled();
  });

  it('reports a confirmed submission and keeps the recovery record', async () => {
    const deps = options();

    const result = await placeBid(deps);

    expect(result.status).toBe('committed');
    expect(result.hash).toBe('hash-1');
    expect(result.recoveryRetained).toBe(true);
    expect(deps.persistRecovery).toHaveBeenCalledTimes(1);
    expect(deps.discardRecovery).not.toHaveBeenCalled();
  });

  it('reports a queued submission as pending and keeps the recovery record', async () => {
    const deps = options({
      broadcast: vi.fn(async () => ({ hash: 'hash-2', status: 'pending' as const })),
    });

    const result = await placeBid(deps);

    expect(result.status).toBe('pending');
    expect(result.hash).toBe('hash-2');
    expect(result.recoveryRetained).toBe(true);
    expect(deps.discardRecovery).not.toHaveBeenCalled();
  });

  it('treats an explicit network rejection as retryable', async () => {
    const deps = options({
      broadcast: vi.fn(async () => {
        throw new TransactionRejectedError('tx_failed');
      }),
    });

    const result = await placeBid(deps);

    expect(result.status).toBe('retryable');
    expect(result.recoveryRetained).toBe(false);
    expect(result.error).toMatch(/tx_failed/);
    expect(deps.discardRecovery).toHaveBeenCalledTimes(1);
  });

  it('persists the recovery record before the transaction is signed', async () => {
    const order: string[] = [];
    const deps = options({
      persistRecovery: vi.fn(async () => {
        order.push('persist');
      }),
      build: vi.fn(async () => {
        order.push('build');
        return 'unsigned-xdr';
      }),
      sign: vi.fn(async () => {
        order.push('sign');
        return 'signed-xdr';
      }),
      broadcast: vi.fn(async () => {
        order.push('broadcast');
        return { hash: 'hash-1', status: 'committed' as const };
      }),
    });

    await placeBid(deps);

    expect(order).toEqual(['persist', 'build', 'sign', 'broadcast']);
  });

  it('never signs or broadcasts when the recovery record cannot be persisted', async () => {
    const deps = options({
      persistRecovery: vi.fn(async () => {
        throw new Error('QuotaExceededError');
      }),
    });

    await expect(placeBid(deps)).rejects.toThrow(/quota/i);
    expect(deps.build).not.toHaveBeenCalled();
    expect(deps.sign).not.toHaveBeenCalled();
    expect(deps.broadcast).not.toHaveBeenCalled();
  });

  it('keeps the recovery record when it cannot be discarded', async () => {
    const deps = options({
      sign: vi.fn(async () => {
        throw new Error('User rejected the request');
      }),
      discardRecovery: vi.fn(async () => {
        throw new Error('storage unavailable');
      }),
    });

    const result = await placeBid(deps);

    expect(result.status).toBe('retryable');
    expect(result.recoveryRetained).toBe(true);
  });
});
