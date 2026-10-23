/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { storeState, wallet, names } = vi.hoisted(() => {
  return {
    storeState: {
      watchedAuctions: [] as { name: string; endsAt: number }[],
      bids: {} as Record<string, unknown>,
      watchAuction: vi.fn(),
      unwatchAuction: vi.fn(),
      saveBid: vi.fn(async () => {}),
      markBidRevealed: vi.fn(async () => {}),
      removeBid: vi.fn(async () => {}),
      status: 'unlocked',
      hasLegacyPlaintext: false,
      hasEncryptedVault: true,
      inspectStorage: vi.fn(),
      setPassphrase: vi.fn(async () => {}),
      unlock: vi.fn(async () => {}),
      lock: vi.fn(),
      exportBackup: vi.fn(async () => '{}'),
      importBackup: vi.fn(async () => {}),
      clearLegacy: vi.fn(async () => false),
    },
    wallet: {
      signTransaction: vi.fn(async () => 'signed-xdr'),
    },
    names: {
      computeNameBidCommitment: vi.fn(async () => 'a'.repeat(64)),
      submitSignedTransaction: vi.fn(async () => ({
        hash: 'hash-1',
        status: 'committed' as const,
      })),
    },
  };
});

vi.mock('@/store/nameWatchlistStore', () => ({
  useNameWatchlistStore: (selector: (state: typeof storeState) => unknown) => selector(storeState),
}));

vi.mock('@/context/StellarWalletContext', () => ({
  useStellarWallet: () => ({
    address: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWH',
    isConnected: true,
    signTransaction: wallet.signTransaction,
  }),
}));

vi.mock('@/context/StealthKeysContext', () => ({
  useStealthKeys: () => ({ stellarMetaAddress: null }),
}));

vi.mock('@/store/contactsStore', () => ({
  useContacts: () => ({ isKnownAddress: () => false }),
}));

vi.mock('@/store/nameHistoryStore', () => ({
  useNameHistory: () => ({ isKnownRecipient: () => false }),
}));

vi.mock('@/lib/stellar/deployments', () => ({
  tryGetStellarContractId: () => 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7',
}));

vi.mock('@/lib/explorer', () => ({
  stellarTxUrl: (hash: string) => `https://stellar.expert/explorer/testnet/tx/${hash}`,
}));

vi.mock('@/lib/stellar/names', () => ({
  MIN_AUCTION_BID_INCREMENT: 1_000_000n,
  buildClaimAuctionNameTransaction: vi.fn(async () => 'xdr'),
  buildCommitNameBidTransaction: vi.fn(async () => 'xdr'),
  buildRefundNameBidTransaction: vi.fn(async () => 'xdr'),
  buildRevealNameBidTransaction: vi.fn(async () => 'xdr'),
  buildSettleNameAuctionTransaction: vi.fn(async () => 'xdr'),
  computeNameBidCommitment: names.computeNameBidCommitment,
  getActiveNameAuctions: vi.fn(async () => [
    {
      name: 'nova',
      commitEnd: Math.floor(Date.now() / 1000) + 3600,
      revealEnd: Math.floor(Date.now() / 1000) + 7200,
      highestBidder: null,
      highestAmount: 0n,
      settled: false,
    },
  ]),
  getNameAuction: vi.fn(async () => null),
  getNameAuctionConfig: vi.fn(async () => ({
    reservePrice: 0n,
    minBidIncrement: 1_000_000n,
    commitSecs: 0,
    revealSecs: 0,
  })),
  submitSignedTransaction: names.submitSignedTransaction,
}));

import NamesAuctions from './NamesAuctions';

async function openBidModal() {
  render(
    <MemoryRouter>
      <NamesAuctions />
    </MemoryRouter>,
  );

  const placeBidButton = await screen.findByRole('button', { name: 'Place bid' });
  fireEvent.click(placeBidButton);

  const dialog = await screen.findByRole('dialog');
  fireEvent.change(screen.getByPlaceholderText('0.0'), { target: { value: '10' } });
  return dialog;
}

describe('name auction bid submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeState.bids = {};
    storeState.watchedAuctions = [];
    storeState.status = 'unlocked';
    wallet.signTransaction.mockImplementation(async () => 'signed-xdr');
    names.computeNameBidCommitment.mockImplementation(async () => 'a'.repeat(64));
    names.submitSignedTransaction.mockImplementation(async () => ({
      hash: 'hash-1',
      status: 'committed',
    }));
  });

  it('keeps the recovery record and reports the hash when the bid is submitted', async () => {
    const dialog = await openBidModal();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Place bid' }));

    await waitFor(() => expect(names.submitSignedTransaction).toHaveBeenCalledTimes(1));
    expect(storeState.saveBid).toHaveBeenCalledTimes(1);
    expect(storeState.removeBid).not.toHaveBeenCalled();
    expect(await screen.findByText(/Transaction submitted\./)).toBeTruthy();
  });

  it('drops the recovery record and allows a retry when the wallet rejects the bid', async () => {
    wallet.signTransaction.mockImplementation(async () => {
      throw new Error('User rejected the request');
    });

    const dialog = await openBidModal();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Place bid' }));

    await waitFor(() => expect(storeState.removeBid).toHaveBeenCalledWith('nova'));
    expect(names.submitSignedTransaction).not.toHaveBeenCalled();
    expect((await screen.findAllByText(/Your bid was not submitted/)).length).toBeGreaterThan(0);
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('drops the recovery record when the transaction fails before it is broadcast', async () => {
    names.computeNameBidCommitment.mockImplementation(async () => {
      throw new Error('simulation failed: insufficient deposit');
    });

    const dialog = await openBidModal();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Place bid' }));

    await waitFor(() => expect(storeState.removeBid).toHaveBeenCalledWith('nova'));
    expect(wallet.signTransaction).not.toHaveBeenCalled();
    expect(names.submitSignedTransaction).not.toHaveBeenCalled();
    expect((await screen.findAllByText(/Your bid was not submitted/)).length).toBeGreaterThan(0);
  });

  it('keeps the recovery record when the broadcast outcome is ambiguous', async () => {
    names.submitSignedTransaction.mockImplementation(async () => {
      throw new TypeError('Failed to fetch');
    });

    const dialog = await openBidModal();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Place bid' }));

    await waitFor(() => expect(names.submitSignedTransaction).toHaveBeenCalledTimes(1));
    expect(storeState.saveBid).toHaveBeenCalledTimes(1);
    expect(storeState.removeBid).not.toHaveBeenCalled();
    expect(await screen.findByText(/did not confirm your bid/i)).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
