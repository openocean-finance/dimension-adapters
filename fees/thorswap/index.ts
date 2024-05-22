import { FetchResultFees, SimpleAdapter } from "../../adapters/types"
import { CHAIN } from "../../helpers/chains"
import { getUniqStartOfTodayTimestamp } from "../../helpers/getUniSubgraphVolume";
import { httpGet } from "../../utils/fetchURL";

interface IRevenue {
  DAY: string;
  NETWORK_FEE: number;
  SLASHING_INCOME: number;
  LIQUIDITY_FEES: number;
  OUTBOUND_FEE: number;
  GAS_REIMBURSEMENT: number;
  IL_PROTECTION: number;
  BLOCK_REWARDS: number;
  REVENUE: number;
  EXPENSES: number;
}

interface IFees {
  DAY: string;
  LIQUIDITY_FEES: number;
  LIQUIDITY_FEES_USD: number;
  BLOCK_REWARDS: number;
  BLOCK_REWARDS_USD: number;
  PCT_OF_EARNINGS_FROM_LIQ_FEES: number;
  PCT_30D_MOVING_AVERAGE: number;
  TOTAL_EARNINGS: number;
  TOTAL_EARNINGS_USD: number;
  EARNINGS_TO_NODES: number;
  EARNINGS_TO_NODES_USD: number;
  EARNINGS_TO_POOLS: number;
  EARNINGS_TO_POOLS_USD: number;
  LIQUIDITY_FEES_USD_CUMULATIVE: number;
  BLOCK_REWARDS_USD_CUMULATIVE: number;
  TOTAL_EARNINGS_USD_CUMULATIVE: number;
  EARNINGS_TO_NODES_USD_CUMULATIVE: number;
  EARNINGS_TO_POOLS_USD_CUMULATIVE: number;
}

interface IEarning {
  bondingEarnings: string;
  runePriceUSD: string;
  startTime: string;
}

const fetchFees = async (timestamp: number): Promise<FetchResultFees> => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const url1 = "https://flipsidecrypto.xyz/api/v1/queries/9ed4f699-100a-41e5-a3e6-a7f9ed3bfd5c/data/latest"
  const url2 = "https://flipsidecrypto.xyz/api/v1/queries/40798a6b-1e67-4ecb-b8b3-8f8354b5798a/data/latest"
  const url3 = `https://midgard.ninerealms.com/v2/history/earnings?interval=day&count=400`
  const [reveune, fees, earnings]: any = (await Promise.all([
    httpGet(url1),
    httpGet(url2),
    httpGet(url3, { headers: {"x-client-id": "defillama"}})
  ]))

  const reveuneData: IRevenue[] = reveune;
  const feesData: IFees[] = fees;
  const earningData: IEarning[] = earnings.intervals;

  const dayTimestampStr = new Date(timestamp * 1000).toISOString().split("T")[0]
  const dailyRevenueData: IRevenue = reveuneData.find(item => item.DAY.split(" ")[0] === dayTimestampStr) as IRevenue
  const dailyFeesData: IFees = feesData.find(item => item.DAY.split(" ")[0] === dayTimestampStr) as IFees
  const dailyErningData: IEarning = earningData.find(item => Number(item.startTime) === dayTimestamp) as IEarning
  const dailyFees = Number(dailyRevenueData.REVENUE) * Number(dailyErningData.runePriceUSD);
  const dailyUsersFees = dailyFeesData?.LIQUIDITY_FEES || 0 + dailyRevenueData?.OUTBOUND_FEE || 0;
  const dailyRevenue = Number(dailyRevenueData.REVENUE) * Number(dailyErningData.runePriceUSD);
  const dailyProtocolRev =  Number(dailyRevenueData.REVENUE) * Number(dailyErningData.runePriceUSD);
  const dailyHoldersRevenue = (Number(dailyErningData.bondingEarnings) / 1e8) *Number(dailyErningData.runePriceUSD);
  const dailySupplySideRevenue = dailyHoldersRevenue


  return {
    dailyFees: dailyFees ? `${dailyFees}` : undefined,
    dailyUserFees: dailyUsersFees ? `${dailyUsersFees}` : undefined,
    dailyRevenue: dailyRevenue ? `${dailyRevenue}` : undefined,
    dailyProtocolRevenue: dailyProtocolRev ? `${dailyProtocolRev}` : undefined,
    dailyHoldersRevenue: dailyHoldersRevenue ? `${dailyHoldersRevenue}` : undefined,
    dailySupplySideRevenue: dailySupplySideRevenue ? `${dailySupplySideRevenue}` : undefined,
    timestamp
  }
}
const adapters: SimpleAdapter = {
  adapter: {
    [CHAIN.THORCHAIN]: {
      runAtCurrTime: true,
      fetch: fetchFees,
      start: 1618099200,
    }
  },
  isExpensiveAdapter: true
}

export default adapters
