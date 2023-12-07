import {
  Finding,
  HandleTransaction,
  FindingSeverity,
  FindingType,
  TransactionEvent,
} from "forta-agent";

export const CREATE_AGENT_EVENT_ABI = "function createAgent(uint256 agentId, address, string metadata, uint256[] chainIds) external";
export const REGISTRY_ADDRESS = "0x61447385B019187daa48e91c55c02AF1F1f3F863";
export const FORTA_BOTS_ADDRESS = "0x88dc3a2284fa62e0027d6d6b1fcfdd2141a143b8";


function provideHandleTransaction(
  eventABI: string,
  registryAddress: string,
  fortaBotsAddress: string,
): HandleTransaction {
  return async function handleTransaction(txEvent: TransactionEvent) {

    // console.log(txEvent);

    const findings: Finding[] = [];

  // Filter Forta Bot transactions are coming from Registry
  const fortaDeploymentEvents = txEvent.filterFunction(
    eventABI,
    registryAddress,
  );

  for (const transferEvent of fortaDeploymentEvents) {
    const address = txEvent.from

    // Compare with transferEvent.from instead of txEvent.from
    if (address === fortaBotsAddress) {
      findings.push(
        Finding.fromObject({
          name: "Forta TX",
          description: "Forta contract tx",
          alertId: "FORTA-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            address,
          },
        })
      );
    }
  }

  return findings;
  }
}


export default {
  handleTransaction: provideHandleTransaction(CREATE_AGENT_EVENT_ABI, REGISTRY_ADDRESS, FORTA_BOTS_ADDRESS),
};
