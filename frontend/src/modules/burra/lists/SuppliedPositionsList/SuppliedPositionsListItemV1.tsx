import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useBurra } from 'src/hooks/burra/useBurra';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { ListColumn } from '../../../../components/lists/ListColumn';
import { useProtocolDataContext } from '../../../../hooks/useProtocolDataContext';
import { isFeatureEnabled } from '../../../../utils/marketsAndNetworksConfig';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemUsedAsCollateral } from '../ListItemUsedAsCollateral';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';

export const SuppliedPositionsListItem = ({
  reserve,
  underlyingBalance,
  underlyingBalanceUSD,
  usageAsCollateralEnabledOnUser,
  underlyingAsset,
}: DashboardReserve) => {
  const { user } = useAppDataContext();
  const { isIsolated, aIncentivesData, isFrozen, isActive, isPaused } = reserve;
  const { currentMarketData, currentMarket } = useProtocolDataContext();
  const { openSupply, openWithdraw, openCollateralChange, openSwap } = useModalContext();
  const { debtCeiling } = useAssetCaps();
  const isSwapButton = isFeatureEnabled.liquiditySwap(currentMarketData);
  const trackEvent = useRootStore((store) => store.trackEvent);
  const { userPositionData, collateralData } = useBurra();

  const canBeEnabledAsCollateral =
    !debtCeiling.isMaxed &&
    reserve.reserveLiquidationThreshold !== '0' &&
    ((!reserve.isIsolated && !user.isInIsolationMode) ||
      user.isolatedReserve?.underlyingAsset === reserve.underlyingAsset ||
      (reserve.isIsolated && user.totalCollateralMarketReferenceCurrency === '0'));

  const disableSwap = !isActive || isPaused || reserve.symbol == 'stETH';
  const disableWithdraw = true;
  const disableSupply = true;

  return (
    <ListItemWrapper
      symbol={collateralData?.symbol || 'DAI'}
      iconSymbol={reserve.iconSymbol} // PUT HERE DAI ICON SOMEHOW
      name={collateralData?.name || 'DAI'}
      detailsAddress={collateralData?.address || ''}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      paused={isPaused}
      data-cy={`dashboardSuppliedListItem_${reserve.symbol.toUpperCase()}_${
        canBeEnabledAsCollateral && usageAsCollateralEnabledOnUser ? 'Collateral' : 'NoCollateral'
      }`}
      showSupplyCapTooltips
      showDebtCeilingTooltips
    >
      <ListValueColumn
        symbol={reserve.iconSymbol}
        value={userPositionData?.deposit}
        subValue={userPositionData?.deposit}
        disabled={userPositionData?.deposit === 0}
      />

      <ListAPRColumn
        value={Number(reserve.supplyAPY)}
        incentives={aIncentivesData}
        symbol={reserve.symbol}
      />

      <ListColumn>
        <ListItemUsedAsCollateral
          disabled={true}
          isIsolated={isIsolated}
          usageAsCollateralEnabledOnUser={usageAsCollateralEnabledOnUser}
          canBeEnabledAsCollateral={canBeEnabledAsCollateral}
          onToggleSwitch={() => {
            openCollateralChange(
              underlyingAsset,
              currentMarket,
              reserve.name,
              'dashboard',
              usageAsCollateralEnabledOnUser
            );
          }}
          data-cy={`collateralStatus`}
        />
      </ListColumn>

      <ListButtonsColumn>
        {isSwapButton ? (
          <Button
            disabled={disableSwap}
            variant="contained"
            onClick={() => {
              // track

              trackEvent(GENERAL.OPEN_MODAL, {
                modal: 'Swap Collateral',
                market: currentMarket,
                assetName: reserve.name,
                asset: underlyingAsset,
              });
              openSwap(underlyingAsset);
            }}
            data-cy={`swapButton`}
          >
            <Trans>Switch</Trans>
          </Button>
        ) : (
          <Button
            disabled={disableSupply}
            variant="contained"
            onClick={() => openSupply(underlyingAsset, currentMarket, reserve.name, 'dashboard')}
          >
            <Trans>Supply</Trans>
          </Button>
        )}
        <Button
          disabled={disableWithdraw}
          variant="outlined"
          onClick={() => {
            openWithdraw(underlyingAsset, currentMarket, reserve.name, 'dashboard');
          }}
        >
          <Trans>Withdraw</Trans>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
