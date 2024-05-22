import retry from "async-retry";
import { IJSON } from "../adapters/types";
import { httpPost } from "../utils/fetchURL";
import { getEnv } from "./env";

const token = {} as IJSON<string>
const FLIPSIDE_API_KEYS = getEnv('FLIPSIDE_API_KEY')?.split(',') ?? ["f3b65679-a179-4983-b794-e41cf40103ed"]
let API_KEY_INDEX = 0;
const MAX_RETRIES = 20;

type IRequest = {
  [key: string]: Promise<any>;
}
const query: IRequest = {};

async function randomDelay() {
  const delay = Math.floor(Math.random() * 4) + 1
  return new Promise((resolve) => setTimeout(resolve, delay * 1000))
}

export async function queryFlipside(sqlQuery: string, maxAgeMinutes: number = 90) {
  if (!query[sqlQuery]) {
    query[sqlQuery] = _queryFlipside(sqlQuery, maxAgeMinutes)
  }
  return query[sqlQuery]
}

async function _queryFlipside(sqlQuery: string, maxAgeMinutes: number = 90) {
  return await retry(
    async (bail, attempt: number) => {
      const FLIPSIDE_API_KEY = FLIPSIDE_API_KEYS[API_KEY_INDEX]
      let query: undefined | any = undefined
      if (!token[sqlQuery]) {
        try{
          query = await httpPost("https://api-v2.flipsidecrypto.xyz/json-rpc",
          {
            "jsonrpc": "2.0",
            "method": "createQueryRun",
            "params": [
                {
                    "resultTTLHours": 5,
                    "maxAgeMinutes": maxAgeMinutes,
                    "sql": sqlQuery,
                    "tags": {
                        "source": "api"
                    },
                    "dataSource": "snowflake-default",
                    "dataProvider": "flipside"
                }
            ],
            "id": 1
        }, {
            headers: {
              "x-api-key": FLIPSIDE_API_KEY,
              'Content-Type': 'application/json'
            },
          }, { withMetadata: true })
          if(query?.result?.queryRun?.id){
            token[sqlQuery] = query?.result.queryRun.id
          } else {
            console.log("error query data", query)
            throw query?.error.message
          }
        } catch(e:any){
          if(e?.response?.statusText === 'Payment Required'){
            if(API_KEY_INDEX < (FLIPSIDE_API_KEYS.length-1)){
              const nextIndex = FLIPSIDE_API_KEYS.findIndex((k: any)=>k===FLIPSIDE_API_KEY) + 1
              if(API_KEY_INDEX < nextIndex){
                API_KEY_INDEX = nextIndex;
              }
              console.info("flipside increasing API_KEY_INDEX to -> ", FLIPSIDE_API_KEYS[API_KEY_INDEX])
              throw "Increasing API_KEY_INDEX";
            } else {
              const error = new Error(`Payment Required`)
              bail(error)
              console.error("Payment Required: " + FLIPSIDE_API_KEY)
              return []
            }
          }
          if (!e.response) {
            bail(e)
            console.error("flipside not found response error")
            return []
          }
          console.log("make query flipside", e.response, e)
          bail(e)
          return []
        }
      }

      if (!token[sqlQuery]) {
        console.error("Couldn't get a token from flipsidecrypto")
        throw new Error("Couldn't get a token from flipsidecrypto")
      }

      const queryStatus = await httpPost(`https://api-v2.flipsidecrypto.xyz/json-rpc`, {
        "jsonrpc": "2.0",
        "method": "getQueryRun",
        "params": [
          {
            "queryRunId": token[sqlQuery]
          }
        ],
        "id": 1
      }, {
        headers: {
          "x-api-key": FLIPSIDE_API_KEY
        }
      }, { withMetadata: true })

      const status = queryStatus.result.queryRun.state
      if (status === "QUERY_STATE_SUCCESS") {
        try {
          let fullRows:any[] = []
          let pageNum = 1;
          let maxPages = 1;
          while(pageNum <= maxPages){
            const results = await httpPost(`https://api-v2.flipsidecrypto.xyz/json-rpc`, {
              "jsonrpc": "2.0",
              "method": "getQueryRunResults",
              "params": [
                {
                  "queryRunId": token[sqlQuery],
                  "format": "csv",
                  "page": {
                    "number": pageNum,
                    "size": 1000
                  }
                }
              ],
              "id": 1
            }, {
              headers: {
                "x-api-key": FLIPSIDE_API_KEY
              }
            }, { withMetadata: true })
            if(results.result.rows === null){
              return [] // empty result
            }
            pageNum = results.result.page.currentPageNumber + 1;
            maxPages = results.result.page.totalPages;
            fullRows = fullRows.concat(results.result.rows.map((t: any[]) => t.slice(0, -1)))
          }
          return fullRows
        } catch (e) {
          console.log("flipside query results", e);
          throw e
        }
      } else if (status === "QUERY_STATE_FAILED") {
        console.log(`Flipside query ${sqlQuery} failed`, queryStatus)
        bail(new Error(`Query ${sqlQuery} failed, error ${JSON.stringify(queryStatus)}`))
        return []; // not returned but just there to make typescript happy
      } else if (status ===  "QUERY_STATE_RUNNING" && (attempt === MAX_RETRIES)) {
        console.log(`Flipside queryRunId ${token[sqlQuery]} still run will cancel!!`)
        await httpPost(`https://api-v2.flipsidecrypto.xyz/json-rpc`, {
          "jsonrpc": "2.0",
          "method": "cancelQueryRun",
          "params": [
              {
                "queryRunId": token[sqlQuery]
              }
          ],
          "id": 1
        }, {
          headers: {
            "x-api-key": FLIPSIDE_API_KEY
          }
        }, { withMetadata: true })
        bail(new Error('max retries exceeded'))
      }
      await randomDelay()
      console.info(`Flipside query ${token[sqlQuery]} still running... retrying ${attempt}`)
      throw new Error("Still running")
    },
    {
      retries: MAX_RETRIES,
      maxTimeout: 1000 * 60 * 5
    }
  );
}
