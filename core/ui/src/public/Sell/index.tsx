import { CandyShop, SingleTokenInfo, safeAwait } from '@liqnft/candy-shop-sdk';
import { Order } from '@liqnft/candy-shop-types';
import { CancelModal } from 'components/CancelModal';
import { Empty } from 'components/Empty';
import { LoadingSkeleton } from 'components/LoadingSkeleton';
import { Nft } from 'components/Nft';
import { SellModal } from 'components/SellModal';
import { LoadStatus } from 'constant';
import useUserNfts from 'hooks/useUserNfts';
import { SolStore, StoreProvider } from 'market';
import React, { useCallback, useMemo, useState } from 'react';
import { getExchangeInfo } from 'utils/getExchangeInfo';
import { ShopProps } from '../../model';

interface SellProps extends ShopProps {
  walletConnectComponent: React.ReactElement;
  style?: { [key: string]: string | number } | undefined;
  enableCacheNFT?: boolean;
}

enum ModalType {
  SELL,
  CANCEL
}

export const Sell: React.FC<SellProps> = ({ walletConnectComponent, style, enableCacheNFT, candyShop, wallet }) => {
  const {
    loading: loadingSell,
    nfts,
    sellOrders: defaultSellOrders,
    shopResponse
  } = useUserNfts({ candyShop, wallet }, { enableCacheNFT });
  const store = useMemo(() => StoreProvider({ candyShop, wallet, shopResponse }), [candyShop, shopResponse, wallet]);

  const [sellOrders, setSellOrders] = useState(defaultSellOrders);
  const [nftSelection, setNftSelection] = useState<SingleTokenInfo>();
  const [visibleModal, setVisibleModal] = useState<ModalType>();

  const getTokenMetadataByMintAddress = useCallback(
    (mintAddress: string) => {
      if (store instanceof SolStore) {
        return store.getTokenMetadataByMintAddress(mintAddress, (candyShop as CandyShop).connection);
      }

      return Promise.reject('getTokenMetadataByMintAddress no impl');
    },
    [candyShop, store]
  );

  const sellNft = useCallback(
    async (nft: SingleTokenInfo, price: number) => {
      const payload = {
        shopAddress: candyShop.candyShopAddress,
        baseUnitsPerCurrency: candyShop.baseUnitsPerCurrency,
        shopCreatorAddress: candyShop.candyShopCreatorAddress,
        shopTreasuryMint: candyShop.treasuryMint,
        candyShopProgramId: candyShop.programId
      };
      const txHash = await store.sell(nft, price, payload);
      console.log('--> sell txHash', txHash);

      const connection = (candyShop as CandyShop).connection;
      const result = await connection.confirmTransaction(txHash, 'finalized');
      console.log('--> sell result', result);

      if (wallet?.publicKey) {
        const orderNfts = await safeAwait(store.getOrderNfts(wallet.publicKey.toString()));
        if (orderNfts.result) {
          console.log('--> orderNfts', orderNfts.result);
          const newSellOrders: Record<string, Order> = {};
          orderNfts.result.forEach((order) => {
            newSellOrders[order.tokenMint] = order;
          });
          console.log('--> newSellOrders', newSellOrders);
          setSellOrders(newSellOrders);
        }
      }

      return txHash;
    },
    [candyShop, store, wallet?.publicKey]
  );

  const cancelOrder = async (order: Order) => {
    const txHash = await store.cancel(order);
    console.log('--> cancel txHash', txHash);

    const connection = (candyShop as CandyShop).connection;
    const result = await connection.confirmTransaction(txHash, 'finalized');
    console.log('--> cancel result', result);

    setSellOrders((prev) => {
      const newSellOrders = { ...prev };
      delete newSellOrders[order.tokenMint];
      return newSellOrders;
    });

    return txHash;
  };

  const onClose = () => {
    setNftSelection(undefined);
    setVisibleModal(undefined);
  };

  const handleClickNft = (nft: SingleTokenInfo, isListing: boolean) => () => {
    setNftSelection(nft);
    setVisibleModal(isListing ? ModalType.CANCEL : ModalType.SELL);
  };

  if (!wallet?.publicKey) {
    return (
      <div className="candy-container" style={{ textAlign: 'center' }}>
        {walletConnectComponent}
      </div>
    );
  }

  const loading = loadingSell !== LoadStatus.Loaded;
  const sellDetail = nftSelection && sellOrders[nftSelection.tokenMintAddress];

  const exchangeInfo = getExchangeInfo(sellDetail, candyShop);

  return (
    <div style={style} className="candy-sell-component">
      <div className="candy-container">
        {loading ? <LoadingSkeleton /> : null}
        {!loading && nfts.length && shopResponse ? (
          <div className="candy-container-list">
            {nfts.map((item) => (
              <div
                key={item.tokenMintAddress}
                onClick={handleClickNft(item, Boolean(sellOrders[item.tokenMintAddress]))}
              >
                <Nft nft={item} sellDetail={sellOrders[item.tokenMintAddress]} />
              </div>
            ))}
          </div>
        ) : null}
        {!loading && nfts.length === 0 && <Empty description="No NFTs found" />}
      </div>

      {visibleModal === ModalType.SELL && nftSelection && shopResponse && (
        <SellModal
          onCancel={onClose}
          nft={nftSelection}
          shopResponse={shopResponse}
          wallet={wallet}
          candyShopEnv={candyShop.env}
          currencySymbol={candyShop.currencySymbol}
          currencyDecimals={candyShop.currencyDecimals}
          explorerLink={candyShop.explorerLink}
          getTokenMetadataByMintAddress={getTokenMetadataByMintAddress}
          sell={sellNft}
        />
      )}

      {visibleModal === ModalType.CANCEL ? (
        <CancelModal
          publicKey={wallet?.publicKey.toString()}
          onClose={onClose}
          order={sellDetail}
          exchangeInfo={exchangeInfo}
          shopPriceDecimalsMin={candyShop.priceDecimalsMin}
          shopPriceDecimals={candyShop.priceDecimals}
          candyShopEnv={candyShop.env}
          explorerLink={candyShop.explorerLink}
          cancelOrder={cancelOrder}
        />
      ) : null}
    </div>
  );
};
