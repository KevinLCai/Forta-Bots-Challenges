import {
  BlockEvent,
  Finding,
  Initialize,
  HandleBlock,
  HealthCheck,
  HandleTransaction,
  HandleAlert,
  AlertEvent,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";

export const ERC20_TRANSFER_EVENT =
  "event Transfer(address indexed from, address indexed to, uint256 value)";
export const FORTA_BOTS_ADDRESS = "0x88dc3a2284fa62e0027d6d6b1fcfdd2141a143b8";
export const TETHER_DECIMALS = 10;
let findingsCount = 0;

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];

  // limiting this agent to emit only 5 findings so that the alert feed is not spammed
  if (findingsCount >= 5) return findings;

  // filter for Forta Bot transactions
  // const fortaDeploymentEvents = txEvent.filterLog(
  //   ERC20_TRANSFER_EVENT,
  //   FORTA_BOTS_ADDRESS
  // );

  // hard code events for now
  const fortaDeploymentEvents = [txEvent, txEvent];

  fortaDeploymentEvents.forEach((transferEvent) => {
    // extract address of transaction
    const address = transferEvent.from;

    // if more than 10,000 Tether were transferred, report it
    if (txEvent.from == FORTA_BOTS_ADDRESS) {
      findings.push(
        Finding.fromObject({
          name: "Forta TX",
          description: `Forta contract tx`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            address,
          },
        })
      );
      findingsCount++;
    }
  });

  return findings;
};


export default {
  // initialize,
  handleTransaction,
  // healthCheck,
  // handleBlock,
  // handleAlert
};
