import { SimpleAdapter } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import { getDexVolumeExports } from "../../helpers/dexVolumeLogs";

const FACTORY_ADDRESS = '0x12508dd9108Abab2c5fD8fC6E4984E46a3CF7824';
const FACTORY_ADDRESS_ZKSYNC = '0x30A0DD3D0D9E99BD0E67b323FB706788766dCff2';
const FACTORY_ADDRESS_ETHERUEM = '0xE8E2b714C57937E0b29c6ABEAF00B52388cAb598';

const adapter: SimpleAdapter = {
  adapter: {
    [CHAIN.ARBITRUM_NOVA]: {
      fetch: getDexVolumeExports({ chain: CHAIN.ARBITRUM_NOVA, factory: FACTORY_ADDRESS }),
      start: 1700784000,
    },
    [CHAIN.ARBITRUM]: {
      fetch: getDexVolumeExports({ chain: CHAIN.ARBITRUM, factory: FACTORY_ADDRESS }),
      start: 1700784000,
    },
    [CHAIN.AVAX]: {
      fetch: getDexVolumeExports({ chain: CHAIN.AVAX, factory: FACTORY_ADDRESS }),
      start: 1708473600,
    },
    [CHAIN.BASE]: {
      fetch: getDexVolumeExports({ chain: CHAIN.BASE, factory: FACTORY_ADDRESS }),
      start: 1700784000,
    },
    [CHAIN.BLAST]: {
      fetch: getDexVolumeExports({ chain: CHAIN.BLAST, factory: FACTORY_ADDRESS }),
      start: 1710720000,
    },
    [CHAIN.BSC]: {
      fetch: getDexVolumeExports({ chain: CHAIN.BSC, factory: FACTORY_ADDRESS }),
      start: 1700784000,
    },
    [CHAIN.CRONOS]: {
      fetch: getDexVolumeExports({ chain: CHAIN.CRONOS, factory: FACTORY_ADDRESS }),
      start: 1708473600,
    },
    [CHAIN.ETHEREUM]: {
      fetch: getDexVolumeExports({ chain: CHAIN.ETHEREUM, factory: FACTORY_ADDRESS_ETHERUEM }),
      start: 1713070800,
    },
    [CHAIN.FANTOM]: {
      fetch: getDexVolumeExports({ chain: CHAIN.FANTOM, factory: FACTORY_ADDRESS }),
      start: 1700784000,
    },
    [CHAIN.FILECOIN]: {
      fetch: getDexVolumeExports({ chain: CHAIN.FILECOIN, factory: FACTORY_ADDRESS }),
      start: 1710979200,
    },
    [CHAIN.FRAXTAL]: {
      fetch: getDexVolumeExports({ chain: CHAIN.FRAXTAL, factory: FACTORY_ADDRESS }),
      start: 1710720000,
    },
    [CHAIN.KAVA]: {
      fetch: getDexVolumeExports({ chain: CHAIN.KAVA, factory: FACTORY_ADDRESS }),
      start: 1700784000,
    },
    [CHAIN.MANTLE]: {
      fetch: getDexVolumeExports({ chain: CHAIN.MANTLE, factory: FACTORY_ADDRESS }),
      start: 1708473600,
    },
    [CHAIN.METIS]: {
      fetch: getDexVolumeExports({ chain: CHAIN.METIS, factory: FACTORY_ADDRESS }),
      start: 1708473600,
    },
    [CHAIN.MODE]: {
      fetch: getDexVolumeExports({ chain: CHAIN.MODE, factory: FACTORY_ADDRESS }),
      start: 1711792800,
    },
    [CHAIN.NEON]: {
      fetch: getDexVolumeExports({ chain: CHAIN.NEON, factory: FACTORY_ADDRESS }),
      start: 1708473600,
    },
    [CHAIN.OPTIMISM]: {
      fetch: getDexVolumeExports({ chain: CHAIN.OPTIMISM, factory: FACTORY_ADDRESS }),
      start: 1700784000,
    },
    [CHAIN.POLYGON]: {
      fetch: getDexVolumeExports({ chain: CHAIN.POLYGON, factory: FACTORY_ADDRESS }),
      start: 1700784000,
    },
    [CHAIN.TELOS]: {
      fetch: getDexVolumeExports({ chain: CHAIN.TELOS, factory: FACTORY_ADDRESS }),
      start: 1700784000,
    },
    [CHAIN.ERA]: {
      fetch: getDexVolumeExports({ chain: CHAIN.ERA, factory: FACTORY_ADDRESS_ZKSYNC }),
      start: 1708473600,
    },
    [CHAIN.ZORA]: {
      fetch: getDexVolumeExports({ chain: CHAIN.ZORA, factory: FACTORY_ADDRESS }),
      start: 1711929600,
    },
  }
};

export default adapter;
