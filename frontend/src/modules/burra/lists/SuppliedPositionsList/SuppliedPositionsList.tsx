import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { Fragment, useState } from 'react';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { useBurra } from 'src/hooks/burra/useBurra';
import { AssetCapsProvider } from 'src/hooks/useAssetCaps';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { CollateralSwitchTooltip } from '../../../../components/infoTooltips/CollateralSwitchTooltip';
import { CollateralTooltip } from '../../../../components/infoTooltips/CollateralTooltip';
import { TotalSupplyAPYTooltip } from '../../../../components/infoTooltips/TotalSupplyAPYTooltip';
import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { useAppDataContext } from '../../../../hooks/app-data-provider/useAppDataProvider';
import {
  DASHBOARD_LIST_COLUMN_WIDTHS,
  DashboardReserve,
  handleSortDashboardReserves,
} from '../../../../utils/dashboardSortUtils';
import { ListTopInfoItem } from '../../../dashboard/lists/ListTopInfoItem';
import { DashboardContentNoData } from '../../DashboardContentNoData';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListLoader } from '../ListLoader';
import { SuppliedPositionsListItem } from './SuppliedPositionsListItem';
import { SuppliedPositionsListMobileItem } from './SuppliedPositionsListMobileItem';

const head = [
  {
    title: <Trans>Asset</Trans>,
    sortKey: 'symbol',
  },
  {
    title: <Trans key="Balance">Balance</Trans>,
    sortKey: 'underlyingBalance',
  },

  {
    title: <Trans key="APY">APY</Trans>,
    sortKey: 'supplyAPY',
  },
  {
    title: (
      <CollateralSwitchTooltip
        event={{
          eventName: GENERAL.TOOL_TIP,
          eventParams: { tooltip: 'Collateral Switch' },
        }}
        text={<Trans>Collateral</Trans>}
        key="Collateral"
        variant="subheader2"
      />
    ),
    sortKey: 'usageAsCollateralEnabledOnUser',
  },
];

export const SuppliedPositionsList = () => {
  const { user, loading } = useAppDataContext();
  const { currentNetworkConfig } = useProtocolDataContext();
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);
  const { userPositionData, collateralData } = useBurra();

  const suppliedPositions =
    user?.userReservesData
      .filter((userReserve) => userReserve.underlyingBalance !== '0')
      .map((userReserve) => ({
        ...userReserve,
        supplyAPY: userReserve.reserve.supplyAPY, // Note: added only for table sort
        reserve: {
          ...userReserve.reserve,
          ...(userReserve.reserve.isWrappedBaseAsset
            ? fetchIconSymbolAndName({
                symbol: currentNetworkConfig.baseAssetSymbol,
                underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
              })
            : {}),
        },
      })) || [];

  // Transform to the DashboardReserve schema so the sort utils can work with it
  const preSortedReserves = suppliedPositions as DashboardReserve[];
  const sortedReserves = handleSortDashboardReserves(
    sortDesc,
    sortName,
    'position',
    preSortedReserves
  );

  const RenderHeader: React.FC = () => {
    return (
      <ListHeaderWrapper>
        {head.map((col) => (
          <ListColumn
            isRow={col.sortKey === 'symbol'}
            maxWidth={col.sortKey === 'symbol' ? DASHBOARD_LIST_COLUMN_WIDTHS.ASSET : undefined}
            key={col.sortKey}
          >
            <ListHeaderTitle
              sortName={sortName}
              sortDesc={sortDesc}
              setSortName={setSortName}
              setSortDesc={setSortDesc}
              sortKey={col.sortKey}
              source="Supplied Positions Dashboard"
            >
              {col.title}
            </ListHeaderTitle>
          </ListColumn>
        ))}
        <ListButtonsColumn isColumnHeader />
      </ListHeaderWrapper>
    );
  };

  if (loading)
    return (
      <ListLoader
        title={<Trans>Asset You Deposited As Collateral</Trans>}
        head={head.map((col) => col.title)}
      />
    );

  return (
    <ListWrapper
      tooltipOpen={tooltipOpen}
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          <Trans>Asset You Deposited As Collateral</Trans>
        </Typography>
      }
      localStorageName="suppliedAssetsDashboardTableCollapse"
      noData={!sortedReserves.length}
      topInfo={
        <>
          {!!sortedReserves.length && (
            <>
              <ListTopInfoItem
                title={<Trans>Balance</Trans>}
                value={collateralData?.balance || 0}
              />
              <ListTopInfoItem
                title={<Trans>APY</Trans>}
                value={4}
                percent
                tooltip={
                  <TotalSupplyAPYTooltip
                    setOpen={setTooltipOpen}
                    event={{
                      eventName: GENERAL.TOOL_TIP,
                      eventParams: { tooltip: 'Total Supplied APY' },
                    }}
                  />
                }
              />
              <ListTopInfoItem
                title={<Trans>Collateral</Trans>}
                value={userPositionData?.deposit || 0}
                tooltip={
                  <CollateralTooltip
                    setOpen={setTooltipOpen}
                    event={{
                      eventName: GENERAL.TOOL_TIP,
                      eventParams: { tooltip: 'Total Supplied Collateral' },
                    }}
                  />
                }
              />
            </>
          )}
        </>
      }
    >
      {userPositionData?.deposit ? (
        <>
          {!downToXSM && <RenderHeader />}
          <SuppliedPositionsListItem />
        </>
      ) : (
        // <>
        //   {!downToXSM && <RenderHeader />}
        //   {sortedReserves.map((item) => (
        //     <Fragment key={item.underlyingAsset}>
        //       {/* <AssetCapsProvider asset={item.reserve}> */}
        //         {downToXSM ? (
        //           <SuppliedPositionsListMobileItem {...item} />
        //         ) : (
        //           <SuppliedPositionsListItem {...item} />
        //         )}
        //       {/* </AssetCapsProvider> */}
        //     </Fragment>
        //   ))}
        // </>
        <>
          {!downToXSM && <RenderHeader />}
          <DashboardContentNoData text={<Trans>Nothing supplied yet</Trans>} />
        </>
      )}
    </ListWrapper>
  );
};
