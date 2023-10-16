import { Order } from '@liqnft/candy-shop-types';
import React, { useEffect, useState } from 'react';

import { FilterType } from 'components/CollectionFilter';
import { InfiniteOrderList } from 'components/InfiniteOrderList';

import { SORT_OPTIONS } from 'constant/Orders';
import { EventName } from 'constant/SocketEvent';
import { BASE_URL } from 'market/utils';
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

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchSellOrders = async () => {
      const resp = await fetch(`${BASE_URL}/order/${candyShop.candyShopAddress}`);
      const data = await resp.json();
      setOrders((data.result as Order[]).filter((i) => i.nftDescription.includes('Carbon offsets')));
    };

    fetchSellOrders();

    const interval = setInterval(() => {
      fetchSellOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, [candyShop.candyShopAddress]);

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
