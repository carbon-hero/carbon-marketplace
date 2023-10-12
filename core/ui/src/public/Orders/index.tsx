import { safeAwait } from '@liqnft/candy-shop-sdk';
import { Order } from '@liqnft/candy-shop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { FilterType } from 'components/CollectionFilter';
import { InfiniteOrderList } from 'components/InfiniteOrderList';

import { SORT_OPTIONS } from 'constant/Orders';
import { EventName } from 'constant/SocketEvent';
import useUserNfts from 'hooks/useUserNfts';
import { StoreProvider } from 'market';
import { useSocket } from 'public/Context/Socket';
import { removeDuplicate, removeListeners } from 'utils/helperFunc';
import { CollectionFilter, OrderDefaultFilter, ShopProps } from '../../model';
import './index.less';

interface OrdersProps extends ShopProps {
  walletConnectComponent: React.ReactElement;
  url?: string;
  identifiers?: number[];
  filters?: CollectionFilter[] | boolean | 'auto';
  defaultFilter?: { [key in OrderDefaultFilter]: string };
  style?: { [key: string]: string | number };
  sellerAddress?: string;
  sellerUrl?: string;
  search?: boolean;
  filterSearch?: boolean;
  filterType?: FilterType;
}

// TODO: Remove hardcode option, filters, defaultFilter and shopFilters should merge into one config interface

/**
 * React component that displays a list of orders
 * @param filters:
 *    - true: list collections from that current shop
 *    - CollectionFilter: hardcode collections
 *    - auto: list collection from Shop filter UI, prop shopFilters=true
 */
export const Orders: React.FC<OrdersProps> = ({ walletConnectComponent, url, style, sellerUrl, candyShop, wallet }) => {
  const sortedByOption = SORT_OPTIONS[0];

  const { onSocketEvent } = useSocket();

  const { shopResponse } = useUserNfts({ candyShop, wallet }, { enableCacheNFT: true });
  const store = useMemo(() => StoreProvider({ candyShop, wallet, shopResponse }), [candyShop, shopResponse, wallet]);

  const [orders, setOrders] = useState<Order[]>([]);

  const getSellOrders = useCallback(async () => {
    if (!wallet || !wallet.publicKey) return [] as Order[];
    const orderNfts = await safeAwait(store.getOrderNfts(wallet.publicKey.toString()));
    return orderNfts.result;
  }, [store, wallet]);

  useEffect(() => {
    const fetchSellOrders = async () => {
      const orders = await getSellOrders();
      if (!orders) return;
      setOrders(orders);
    };

    fetchSellOrders();

    const interval = setInterval(() => {
      fetchSellOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, [getSellOrders]);

  console.log('--> selling orders', orders);

  useEffect(() => {
    const controllers = [
      onSocketEvent(EventName.orderOpened, (order: Order) => {
        setOrders((list) => {
          const newList = removeDuplicate<Order>([order], list, 'tokenMint');

          const { column, order: sortOrder } = sortedByOption.value as { column: keyof Order; order: 'asc' | 'desc' };
          const sortFunc = (a: Order, b: Order) =>
            (
              sortOrder === 'desc'
                ? (a[column] as string) > (b[column] as string)
                : (a[column] as string) < (b[column] as string)
            )
              ? -1
              : 1;

          newList.sort(sortFunc);
          return newList;
        });
      }),
      onSocketEvent(EventName.orderCanceled, (order: { tokenMint: string }) => {
        setOrders((list) => list.filter((item) => item.tokenMint !== order.tokenMint));
      }),
      onSocketEvent(EventName.orderFilled, (order: { tokenMint: string }) => {
        setOrders((list) => list.filter((item) => item.tokenMint !== order.tokenMint));
      })
    ];

    return () => removeListeners(controllers);
  }, [onSocketEvent, sortedByOption.value]);

  const InfiniteOrderListView = (
    <InfiniteOrderList
      orders={orders}
      walletConnectComponent={walletConnectComponent}
      url={url}
      hasNextPage={false}
      loadNextPage={() => {}}
      sellerUrl={sellerUrl}
      candyShop={candyShop}
      wallet={wallet}
    />
  );

  return (
    <>
      <div className="candy-orders-container" style={style}>
        <div className="candy-container">{InfiniteOrderListView}</div>
      </div>
    </>
  );
};
