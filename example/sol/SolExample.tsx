import React, { useCallback, useMemo, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-ant-design';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { getPhantomWallet, getSolflareWallet } from '@solana/wallet-adapter-wallets';
import { web3 } from '@project-serum/anchor';
import { SolMarketplaceExample } from './SolMarketplaceExample';
import { CandyShopDataValidator } from '../../core/ui/.';
import { CandyShop } from '../../core/sdk/.';
import { ShopConfig } from './ShopConfig';
import { Cluster } from '@solana/web3.js';

export const SolExample: React.FC = () => {
  const [candyShop, setCandyShop] = useState<CandyShop | null>();

  const endpoint = useMemo(() => web3.clusterApiUrl((candyShop?.env || 'devnet') as Cluster), [candyShop?.env]);
  const wallets = useMemo(() => [getPhantomWallet(), getSolflareWallet()], []);

  const onSetCandyShop = useCallback((candyShop: CandyShop) => setCandyShop(candyShop), []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <CandyShopDataValidator>
            <>
              <div
                style={{
                  padding: '10px 10px 50px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: 16, marginRight: 20 }}>Carbon Market</span>
                </div>
                <div>
                  <ShopConfig onSetCandyShop={onSetCandyShop} />
                  <WalletMultiButton />
                </div>
              </div>
              {candyShop === undefined ? (
                <div style={{ textAlign: 'center' }}>Loading...</div>
              ) : candyShop === null ? (
                <div style={{ paddingTop: '30px', textAlign: 'center' }}>Error: Invalid shop configuration</div>
              ) : (
                <Switch>
                  <Route path="/" render={() => <SolMarketplaceExample candyShop={candyShop} />} />
                </Switch>
              )}
            </>
          </CandyShopDataValidator>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
