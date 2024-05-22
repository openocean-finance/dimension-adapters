import { BreakdownAdapter, ChainBlocks, Fetch, FetchOptions, IStartTimestamp } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import { getUniqStartOfTodayTimestamp } from "../../helpers/getUniSubgraphVolume";
import { postURL } from "../../utils/fetchURL";
import dailyVolumePayload from "./dailyVolumePayload";

/* const endpoints = {
  [CHAIN.ARBITRUM]: "https://api.dodoex.io/graphql?opname=FetchDashboardDailyData",
  [CHAIN.AURORA]: "https://api.dodoex.io/graphql?opname=FetchDashboardDailyData",
  [CHAIN.BSC]: "https://api.dodoex.io/graphql?opname=FetchDashboardDailyData",
  [CHAIN.ETHEREUM]: "https://api.dodoex.io/graphql?opname=FetchDashboardDailyData",
  [CHAIN.POLYGON]: "https://api.dodoex.io/graphql?opname=FetchDashboardDailyData",
  // [MOONRIVER]: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-moonriver",
  // [AVAX]: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-avax",
  // [BOBA]: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-boba"
  // [HECO]: "https://n10.hg.network/subgraphs/name/dodoex-mine-v3-heco/heco",
  // [OKEXCHAIN]: "https://graph.kkt.one/subgraphs/name/dodoex/dodoex-v2-okchain",
} as ChainEndpoints */
const dailyEndpoint = "https://api.dodoex.io/graphql?opname=FetchDashboardDailyData&apikey=graphqldefiLlamadodoYzj5giof"
const totalEndpoint = "https://api.dodoex.io/graphql?opname=FetchDashboardInfoData&apikey=graphqldefiLlamadodoYzj5giof"
const chains = [
  CHAIN.ARBITRUM,
   CHAIN.BSC,
   CHAIN.ETHEREUM,
   CHAIN.POLYGON,
   CHAIN.AVAX,
   CHAIN.OPTIMISM,
   CHAIN.BASE,
   CHAIN.LINEA,
   CHAIN.SCROLL,
  //  CHAIN.MANTA
]

interface IDailyResponse {
  data: {
    dashboard_chain_day_data: {
      list: Array<{
        timestamp: number,
        volume: {
          [chain: string]: string
        }
      }>
    }
  }
}

interface ITotalResponse {
  data: {
    dashboard_pairs_count_data: {
      totalVolume: string
    }
  }
}

const getFetch = (chain: string): Fetch => async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const dailyResponse = (await postURL(dailyEndpoint, dailyVolumePayload(chain))) as IDailyResponse
  // const totalResponse = (await postURL(totalEndpoint, totalVolumePayload(chain))) as ITotalResponse

  return {
    timestamp: dayTimestamp,
    dailyVolume: dailyResponse.data.dashboard_chain_day_data.list.find((item: any) => item.timestamp === dayTimestamp)?.volume[chain],
    // totalVolume: totalResponse.data.dashboard_pairs_count_data.totalVolume
  }
}

const getStartTimestamp = (chain: string): IStartTimestamp => async () => {
  const response = (await postURL(dailyEndpoint, dailyVolumePayload(chain))) as IDailyResponse
  const firstDay = response.data.dashboard_chain_day_data.list.find((item: any) => item.volume[chain] !== '0')
  return firstDay?.timestamp ?? 0
}

const chainConversion = (chain: string): string => {
  switch (chain) {
    case CHAIN.SCROLL:
        return 'scr';
    case CHAIN.MANTA:
        return 'manta';
    case CHAIN.AVAX:
        return 'avalanche';
    default:
        return chain;
  }
}

const volume = chains.reduce(
  (acc, chain) => ({
    ...acc,
    [chain]: {
      fetch: getFetch(chainConversion(chain)),
      start: getStartTimestamp(chainConversion(chain))
    },
  }),
  {}
);


// https://api.dodoex.io/dodo-contract/list
const config: any = {
  ethereum: { DODOFeeRouteProxys: ['0x21b9F852534Fb9DdC3A0A7B24f067B50d8AC9a99', '0x50f9bDe1c76bba997a5d6e7FEFff695ec8536194']},
  optimism: { DODOFeeRouteProxys: ['0x716fcc67dcA500A91B4a28c9255262c398D8f971', '0xc7d7CC1e9f5E823887980c9C51F9c418ee3A3e28']},
  bsc: { DODOFeeRouteProxys: ['0xa8b034301Bb5DD3610db585Def3e7C0d52f2319F', '0x0656fD85364d03b103CEEda192FB2D3906A6ac15']},
  polygon: { DODOFeeRouteProxys: ['0x39E3e49C99834C9573c9FC7Ff5A4B226cD7B0E63', '0xA103206E7f19d1C1c0e31eFC4DFc7b299630F100']},
  boba: { DODOFeeRouteProxys: ['0x64842A3EbC09bB69429c1a34ae181375fea5f17F', '0xfcA520C94078b65F8237d4F566c438a9468917A1']},
  conflux: { DODOFeeRouteProxys: ['0x3037e79FCe8817A6F21196d8D93C80F53ABB9267', '0x5a71a8524477Acd1807CFefD114Bf8904CD8dF96']},
  moonriver: { DODOFeeRouteProxys: ['0x003B18357460e789e711849749A793c430d14f97', '0x2144BF2003bFd9Aa0950716333fBb5B7A1Caeda4']},
  mantle: { DODOFeeRouteProxys: ['0xB4E598688eC724DD00a8944E7c7b259BbB992c61', '0x70B9C57E1fF24761C1C3ced57Ddae9A3F3570698']},
  base: { DODOFeeRouteProxys: ['0x987bFBE33c9cF18cAA665B792Db66339a9c16D32', '0xA376762070F7fCE8f3646AAe90e6e375e6daF128']},
  avax: { DODOFeeRouteProxys: ['0xbce44767af0a53A108b3B7ba4F740E03D228Ec0A', '0x1F076a800005c758a505E759720eb6737136e893']},
  arbitrum: { DODOFeeRouteProxys: ['0xe05dd51e4eB5636f4f0E8e7Fbe82eA31a2ecef16', '0xc4A1a152812dE96b2B1861E433f42290CDD7f113']},
  linea: { DODOFeeRouteProxys: ['0x70B9C57E1fF24761C1C3ced57Ddae9A3F3570698', '0x03e89fC55A5ad0531576E5a502c4CA52c8bf391B']},
  scroll: { DODOFeeRouteProxys: ['0xf0512872fEc0173d1d99c2dd8CDCb770054b675b', '0x4e998615aD430C1cA46A69d813edE6EB3EC55eDb']},
}

const abis = {
  "OrderHistory": "event OrderHistory (address fromToken, address toToken, address sender, uint256 fromAmount, uint256 returnAmount)",
}

const fetch = async (timestamp: number, _: ChainBlocks, { createBalances, getLogs, chain }: FetchOptions) => {
  const dailyVolume = createBalances()

  const logs = await getLogs({ targets: config[chain].DODOFeeRouteProxys, eventAbi: abis.OrderHistory, })
  logs.forEach((log: any) => {
    dailyVolume.add(log.toToken, log.returnAmount)
  })
  return { timestamp, dailyVolume }
};

const adapter_agg: any = {
  adapter: {},
};

Object.keys(config).forEach((chain) => adapter_agg.adapter[chain] = { fetch, start: 1690848000, });


const adapter: any = {
  adapter: volume
};

const adapterBreakdown: BreakdownAdapter = {
  breakdown: {
    "dodo": adapter.adapter,
    "dodo-agg": adapter_agg["adapter"],
  }
}

export default adapterBreakdown
