import { CandyShop } from '@liqnft/candy-shop-sdk';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { ShopProps } from 'model';
import { Store } from './catalog';
import { SolStore } from './SolStore';

export const StoreProvider = ({ candyShop, wallet }: ShopProps): Store => {
  const solShop: CandyShop = candyShop as CandyShop;
  return new SolStore(solShop, wallet as AnchorWallet, solShop.connection, solShop.isEnterprise);
};
