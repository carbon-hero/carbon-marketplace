import { BaseShop, SingleTokenInfo } from '@liqnft/candy-shop-sdk';
import { Order, Auction, CandyShop as CandyShopResponse, SingleBase, Nft } from '@liqnft/candy-shop-types';
import qs from 'qs';
import { BASE_URL, getParametrizeQuery } from './utils';

export interface SolSellerOptions {
  shopAddress: string;
  candyShopProgramId?: string;
  baseUnitsPerCurrency: number;
  shopTreasuryMint: string;
  shopCreatorAddress: string;
}

export abstract class Store {
  protected baseShop: BaseShop;

  constructor(shop: BaseShop) {
    this.baseShop = shop;
  }

  /* Shared methods with same implementation */
  public async getOrderNfts(walletAddress: string): Promise<Order[]> {
    const limit = 12;
    let offset = 0;
    let resCount: number | null = null;
    let orders: Order[] = [];

    while (resCount === null || resCount == limit) {
      const queryParams = {
        offset,
        limit,
        'filterArr[]': JSON.stringify({
          side: 1,
          status: 0,
          walletAddress
        })
      };
      const queryString = qs.stringify(queryParams, { indices: false });
      const url = `${BASE_URL}/order/${this.baseShop.candyShopAddress}`.concat(getParametrizeQuery(queryString));
      const resp = await fetch(url);
      const data = await resp.json();
      const page = data?.result;
      resCount = page.length;
      offset = offset + limit;
      orders = orders.concat(page);
    }

    return orders;
    // return fetchOrdersByShopAndWalletAddress(this.baseShop.candyShopAddress, walletAddress);
  }

  /* Required common shop data methods */
  abstract getShop(): Promise<CandyShopResponse>;
  abstract getNFTs(
    walletPublicKey: string,
    options: { enableCacheNFT?: boolean; allowSellAnyNft?: number; candyShopAddress: string }
  ): Promise<SingleTokenInfo[]>;
  abstract getOrderNft(tokenMint: string): Promise<SingleBase<Order>>;
  abstract getNftInfo(tokenMint: string): Promise<Nft>;

  /* Required common trading methods */
  abstract buy(order: Order): Promise<string>;
  abstract sell(nft: SingleTokenInfo, price: number, options?: SolSellerOptions): Promise<string>;
  abstract cancel(order: Order): Promise<any>;
}

export interface Auctionner {
  createAuction(params: unknown): Promise<string>;
  buyNowAuction(auction: Auction): Promise<string>;
  bidAuction(auction: Auction, price: number): Promise<string>;
  withdrawAuctionBid(auction: Auction): Promise<string>;
}
