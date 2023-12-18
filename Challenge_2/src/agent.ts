import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  getEthersProvider,
} from "forta-agent";
import { ethers } from "ethers";
import {
  FACTORY_ADDRESS,
  SWAP_EVENT_ABI,
  UNISWAP_V3_FACTORY_ABI,
  UNISWAP_TOKEN_POOL_ABI,
} from "./constants";
import { poolExists } from "./utils";

export function provideHandleTransaction(
  factoryAddress: string,
  swapEventABI: string,
  factoryABI: string[],
  tokenPoolABI: string[],
  provider: ethers.providers.Provider
): HandleTransaction {
  return async function handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = [];

    const v3SwapEvents = txEvent.filterLog(swapEventABI);

    for (const v3SwapEvent of v3SwapEvents) {
      const uniswapPoolAddress = v3SwapEvent.address;
      const { sender, recipient, amount0, amount1, liquidity } =
        v3SwapEvent.args;

      const uniswapPoolExists = await poolExists(
        factoryAddress,
        factoryABI,
        tokenPoolABI,
        uniswapPoolAddress,
        provider
      );

      if (uniswapPoolExists) {
        findings.push(
          Finding.fromObject({
            name: "Uniswap Swap",
            description: `Uniswap Swap Detected`,
            alertId: "NETHERMIND-1",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              recipient,
              sender,
            },
          })
        );
      }
    }
    return findings;
  };
}

export default {
  handleTransaction: provideHandleTransaction(
    FACTORY_ADDRESS,
    SWAP_EVENT_ABI,
    UNISWAP_V3_FACTORY_ABI,
    UNISWAP_TOKEN_POOL_ABI,
    getEthersProvider()
  ),
};
