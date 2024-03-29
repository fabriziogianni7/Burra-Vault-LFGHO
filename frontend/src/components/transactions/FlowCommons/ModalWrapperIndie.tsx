import { API_ETH_MOCK_ADDRESS, PERMISSION } from '@aave/contract-helpers';
import React from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import {
  ComputedReserveData,
  ComputedUserReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { AssetCapsProvider } from 'src/hooks/useAssetCaps';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useModalContext } from 'src/hooks/useModal';
import { usePermissions } from 'src/hooks/usePermissions';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getNetworkConfig, isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { TxErrorView } from './Error';
import { TxModalTitle } from './TxModalTitle';

export interface ModalWrapperProps {
  underlyingAsset?: string;
  poolReserve?: ComputedReserveData;
  userReserve?: ComputedUserReserveData;
  symbol?: string;
  tokenBalance?: string;
  nativeBalance?: string;
  isWrongNetwork?: boolean;
  action?: string;
}

export const ModalWrapperIndie: React.FC<{
  underlyingAsset: string;
  title: ReactElement;
  requiredChainId?: number;
  // if true wETH will stay wETH otherwise wETH will be returned as ETH
  keepWrappedSymbol?: boolean;
  hideTitleSymbol?: boolean;
  requiredPermission?: PERMISSION;
  children: (props: ModalWrapperProps) => React.ReactNode;
  action?: string;
}> = ({
  hideTitleSymbol,
  underlyingAsset,
  children,
  requiredChainId: _requiredChainId,
  title,
  requiredPermission,
  keepWrappedSymbol,
}) => {
  const { readOnlyModeAddress } = useWeb3Context();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const { walletBalances } = useWalletBalances(currentMarketData);
  const { txError, mainTxState } = useModalContext();
  const { permissions } = usePermissions();

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }

  if (
    requiredPermission &&
    isFeatureEnabled.permissions(currentMarketData) &&
    !permissions.includes(requiredPermission) &&
    currentMarketData.permissionComponent
  ) {
    return <>{currentMarketData.permissionComponent}</>;
  }

  // const poolReserve = reserves.find((reserve) => {
  //   if (underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())
  //     return reserve.isWrappedBaseAsset;
  //   return underlyingAsset === reserve.underlyingAsset;
  // }) as ComputedReserveData;

  // const userReserve = user?.userReservesData.find((userReserve) => {
  //   if (underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())
  //     return userReserve.reserve.isWrappedBaseAsset;
  //   return underlyingAsset === userReserve.underlyingAsset;
  // }) as ComputedUserReserveData;

  const symbol = 'GHO';

  return (
    // <AssetCapsProvider asset={poolReserve}>
    <>
      <TxModalTitle title={title} symbol={undefined} />
      {children({
        nativeBalance: walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount || '0',
        tokenBalance:
          walletBalances['0x8a4FcC53C2D19C69AEB51dfEF05a051d40927CE2'.toLowerCase()]?.amount || '0',
        symbol,
        underlyingAsset,
      })}
    </>
  );
};
