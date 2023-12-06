import {
  Finding,
  HandleTransaction,
  FindingSeverity,
  FindingType,
  TransactionEvent,
} from "forta-agent";

export const CREATE_AGENT_EVENT_ABI =
  "function createAgent(uint256 agentId, address, string metadata, uint256[] chainIds) external";
export const FORTA_BOTS_ADDRESS = "0x88dc3a2284fa62e0027d6d6b1fcfdd2141a143b8";

function provideHandleTransaction(
  eventABI: string,
  fortaBotsAddress: string,
): HandleTransaction {
  return async function handleTransaction(txEvent: TransactionEvent) {

    const findings: Finding[] = [];

  // Filter Forta Bot transactions
  const fortaDeploymentEvents = txEvent.filterFunction(
    eventABI,
    fortaBotsAddress
  );

  // const fortaDeploymentEvents: TransactionEvent[] = [txEvent];

  console.log("LOGS")
  console.log(fortaDeploymentEvents)

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
  handleTransaction: provideHandleTransaction(CREATE_AGENT_EVENT_ABI, FORTA_BOTS_ADDRESS),
};
