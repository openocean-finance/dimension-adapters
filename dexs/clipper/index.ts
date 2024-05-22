import { Chain } from "@defillama/sdk/build/general";
import { SimpleAdapter } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
const {
  getChainVolume,
} = require("../../helpers/getUniSubgraphVolume");
const endpoints = {
  [CHAIN.ETHEREUM]: "https://api.thegraph.com/subgraphs/name/edoapp/clipper-mainnet",
  [CHAIN.OPTIMISM]: "https://api.thegraph.com/subgraphs/name/edoapp/clipper-optimism",
  [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/edoapp/clipper-polygon",
  [CHAIN.MOONBEAN]: "https://api.thegraph.com/subgraphs/name/edoapp/clipper-moonbeam",
  [CHAIN.ARBITRUM]: "https://api.thegraph.com/subgraphs/name/edoapp/clipper-arbitrum",
};


const VOLUME_FIELD = "volumeUSD";
const graphs = getChainVolume({
  graphUrls: endpoints,
  totalVolume: {
    factory: "pools",
    field: VOLUME_FIELD,
  },
  hasDailyVolume: false,
});


const adapter: SimpleAdapter = {
  version: 2,
  adapter: Object.keys(endpoints).reduce((acc, chain: any) => {
    return {
      ...acc,
      [chain]: {
        fetch: graphs(chain as Chain),
        start: 1657437036,
      }
    }
  }, {})
};

export default adapter;
