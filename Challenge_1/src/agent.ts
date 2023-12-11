import {
  Finding,
  HandleTransaction,
  FindingSeverity,
  FindingType,
  TransactionEvent,
} from "forta-agent";

export const CREATE_AGENT_EVENT_ABI =
  "function createAgent(uint256 agentId,address ,string metadata,uint256[] chainIds)";
export const UPDATE_AGENT_EVENT_ABI =
  "function updateAgent(uint256 agentId,string metadata,uint256[] chainIds)";
export const REGISTRY_ADDRESS = "0x61447385B019187daa48e91c55c02AF1F1f3F863";
export const FORTA_BOTS_ADDRESS = "0x88dc3a2284fa62e0027d6d6b1fcfdd2141a143b8";

function provideHandleTransaction(
  createAgentEventABI: string,
  updateAgentEventABI: string,
  registryAddress: string,
  fortaBotsAddress: string
): HandleTransaction {
  return async function handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = [];

    // Filter Forta Bot transactions are coming from Registry
    const createAgentEvents = txEvent.filterFunction(
      createAgentEventABI,
      registryAddress
    );

    const updateAgentEvents = txEvent.filterFunction(
      updateAgentEventABI,
      registryAddress
    );

    for (const createAgentEvent of createAgentEvents) {
      const createAgentEventAddress = txEvent.from;

      // Compare with transferEvent.from instead of txEvent.from
      if (createAgentEventAddress === fortaBotsAddress) {
        findings.push(
          Finding.fromObject({
            name: "Agent Created",
            description: "NM Agent Created",
            alertId: "NETHERMIND-1",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              createAgentEventAddress,
            },
          })
        );
      }
    }

    for (const updateAgentEvent of updateAgentEvents) {
      const updateAgentEventAddress = txEvent.from;

      // Compare with transferEvent.from instead of txEvent.from
      if (updateAgentEventAddress === fortaBotsAddress) {
        findings.push(
          Finding.fromObject({
            name: "Agent Update",
            description: "NM Agent Updated",
            alertId: "NETHERMIND-2",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              updateAgentEventAddress,
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
    CREATE_AGENT_EVENT_ABI,
    UPDATE_AGENT_EVENT_ABI,
    REGISTRY_ADDRESS,
    FORTA_BOTS_ADDRESS
  ),
};
