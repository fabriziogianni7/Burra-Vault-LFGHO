import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyBaseFork } from '../../../../support/steps/configuration.steps';
import {
  borrow,
  changeCollateral,
  changeCollateralNegative,
  repay,
  supply,
  withdraw,
} from '../../../../support/steps/main.steps';
import {
  borrowsUnavailable,
  dashboardAssetValuesVerification,
} from '../../../../support/steps/verification.steps';

const testData = {
  testCases: {
    deposit: {
      asset: assets.baseV3Market.ETH,
      amount: 1.09,
      hasApproval: true,
    },
    collateral: {
      switchOff: {
        asset: assets.baseV3Market.ETH,
        isCollateralType: true,
        hasApproval: true,
      },
      switchOn: {
        asset: assets.baseV3Market.ETH,
        isCollateralType: false,
        hasApproval: true,
      },
      switchNegative: {
        asset: assets.baseV3Market.ETH,
        isCollateralType: true,
      },
    },
    borrow: [
      {
        asset: assets.baseV3Market.ETH,
        amount: 0.06,
        apyType: constants.borrowAPYType.default,
        hasApproval: false,
      },
    ],
    withdraw: [
      {
        asset: assets.baseV3Market.ETH,
        isCollateral: true,
        amount: 0.01,
        hasApproval: false,
      },
      {
        asset: assets.baseV3Market.ETH,
        isCollateral: true,
        amount: 0.01,
        hasApproval: true,
        forWrapped: true,
      },
    ],
    repay: [
      {
        asset: assets.baseV3Market.ETH,
        apyType: constants.apyType.variable,
        amount: 0.01,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.baseV3Market.ETH,
        apyType: constants.apyType.variable,
        repayableAsset: assets.baseV3Market.WETH,
        amount: 0.01,
        hasApproval: false,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.baseV3Market.ETH,
        apyType: constants.apyType.variable,
        repayableAsset: assets.baseV3Market.aWETH,
        amount: 0.01,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.ethereumV3Market.ETH.shortName,
        amount: 1.06,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.ethereumV3Market.ETH.shortName,
        amount: 0.03,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};
//due oracle
describe('ETH INTEGRATION SPEC, BASE V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyBaseFork({ v3: true });

  supply(testData.testCases.deposit, skipTestState, true);
  describe('Check Collateral switching', () => {
    changeCollateral(testData.testCases.collateral.switchOff, skipTestState, false);
    borrowsUnavailable(skipTestState);
    changeCollateral(testData.testCases.collateral.switchOn, skipTestState, false);
  });
  testData.testCases.borrow.forEach((borrowCase) => {
    borrow(borrowCase, skipTestState, true);
  });
  changeCollateralNegative(testData.testCases.collateral.switchNegative, skipTestState, false);
  testData.testCases.withdraw.forEach((withdrawCase) => {
    withdraw(withdrawCase, skipTestState, false);
  });
  testData.testCases.repay.forEach((repayCase) => {
    repay(repayCase, skipTestState, false);
  });
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
