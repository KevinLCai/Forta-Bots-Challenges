import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
  ethers,
  TransactionEvent,
} from "forta-agent";
import agent, {
  CREATE_AGENT_EVENT_ABI,
  UPDATE_AGENT_EVENT_ABI,
  FORTA_BOTS_ADDRESS,
  REGISTRY_ADDRESS,
} from "./agent";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { createAddress } from "forta-agent-tools";
import { Interface } from "@ethersproject/abi";

describe("Forta Bot Deployment Agent", () => {
  let handleTransaction: HandleTransaction;

  beforeAll(() => {
    handleTransaction = agent.handleTransaction;
  });

  const mockTxEventData1 = [1, createAddress("0x01"), "Mock tx 1", [137]];
  const mockTxEventData2 = [1, createAddress("0x02"), "Mock tx 2", [137]];

  const WRONG_FUNCTION_ABI =
    "function wrongFunction(uint256 agentId,address ,string metadata,uint256[] chainIds)";

  describe("handleTransaction", () => {
    const createAgentInterface = new Interface([CREATE_AGENT_EVENT_ABI]);
    const updateAgentInterface = new Interface([UPDATE_AGENT_EVENT_ABI]);
    const wrongFunctionInterface = new Interface([WRONG_FUNCTION_ABI]);
    const wrongAddress = createAddress("0x00");

    it("returns finding if there is one bot deployment", async () => {
      let mockTxEvent: TransactionEvent = new TestTransactionEvent()
        .setTo(REGISTRY_ADDRESS)
        .setFrom(FORTA_BOTS_ADDRESS)
        .addTraces({
          function: createAgentInterface.getFunction("createAgent"),
          to: REGISTRY_ADDRESS,
          from: FORTA_BOTS_ADDRESS,
          arguments: mockTxEventData1,
        });

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        expect.objectContaining({
          name: "Forta TX",
          description: "Forta contract tx",
          alertId: "FORTA-1",
          protocol: "ethereum",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            createAgentEventAddress: FORTA_BOTS_ADDRESS,
          },
          addresses: [],
          labels: [],
          uniqueKey: "",
          source: {},
        }),
      ]);
    });

    it("returns findings if there are multiple bot deployments", async () => {
      let mockTxEvent: TransactionEvent = new TestTransactionEvent()
        .setTo(REGISTRY_ADDRESS)
        .setFrom(FORTA_BOTS_ADDRESS)
        .addTraces({
          function: createAgentInterface.getFunction("createAgent"),
          to: REGISTRY_ADDRESS,
          from: FORTA_BOTS_ADDRESS,
          arguments: mockTxEventData1,
        })
        .addTraces({
          function: createAgentInterface.getFunction("createAgent"),
          to: REGISTRY_ADDRESS,
          from: FORTA_BOTS_ADDRESS,
          arguments: mockTxEventData1,
        });

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        expect.objectContaining({
          name: "Forta TX",
          description: "Forta contract tx",
          alertId: "FORTA-1",
          protocol: "ethereum",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            createAgentEventAddress: FORTA_BOTS_ADDRESS,
          },
          addresses: [],
          labels: [],
          uniqueKey: "",
          source: {},
        }),
        expect.objectContaining({
          name: "Forta TX",
          description: "Forta contract tx",
          alertId: "FORTA-1",
          protocol: "ethereum",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            createAgentEventAddress: FORTA_BOTS_ADDRESS,
          },
          addresses: [],
          labels: [],
          uniqueKey: "",
          source: {},
        }),
      ]);
    });

    it("returns multiple findings for different function calls", async () => {
      let mockTxEvent: TransactionEvent = new TestTransactionEvent()
        .setTo(REGISTRY_ADDRESS)
        .setFrom(FORTA_BOTS_ADDRESS)
        .addTraces({
          function: updateAgentInterface.getFunction("updateAgent"),
          to: REGISTRY_ADDRESS,
          from: FORTA_BOTS_ADDRESS,
          arguments: mockTxEventData2,
        })
        .addTraces({
          function: createAgentInterface.getFunction("createAgent"),
          to: REGISTRY_ADDRESS,
          from: FORTA_BOTS_ADDRESS,
          arguments: mockTxEventData1,
        });

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        expect.objectContaining({
          name: "Forta TX",
          description: "Forta contract tx",
          alertId: "FORTA-1",
          protocol: "ethereum",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            createAgentEventAddress: FORTA_BOTS_ADDRESS,
          },
          addresses: [],
          labels: [],
          uniqueKey: "",
          source: {},
        }),
        expect.objectContaining({
          name: "Forta TX",
          description: "Forta contract tx",
          alertId: "FORTA-1",
          protocol: "ethereum",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            updateAgentEventAddress: FORTA_BOTS_ADDRESS,
          },
          addresses: [],
          labels: [],
          uniqueKey: "",
          source: {},
        }),
      ]);
    });

    it("returns empty findings if the deployment address is wrong", async () => {
      let mockTxEvent: TransactionEvent = new TestTransactionEvent()
        .setTo(REGISTRY_ADDRESS)
        .setFrom(wrongAddress)
        .addTraces({
          function: createAgentInterface.getFunction("createAgent"),
          to: REGISTRY_ADDRESS,
          from: wrongAddress,
          arguments: mockTxEventData1,
        });

      const findings = await handleTransaction(mockTxEvent);
      expect(findings).toStrictEqual([]);
    });

    it("returns empty findings if the registry address is wrong", async () => {
      let mockTxEvent: TransactionEvent = new TestTransactionEvent()
        .setTo(wrongAddress)
        .setFrom(FORTA_BOTS_ADDRESS)
        .addTraces({
          function: createAgentInterface.getFunction("createAgent"),
          to: wrongAddress,
          from: FORTA_BOTS_ADDRESS,
          arguments: mockTxEventData1,
        });

      const findings = await handleTransaction(mockTxEvent);
      expect(findings).toStrictEqual([]);
    });

    it("returns empty findings if the function ABI is wrong", async () => {
      let mockTxEvent: TransactionEvent = new TestTransactionEvent()
        .setTo(REGISTRY_ADDRESS)
        .setFrom(FORTA_BOTS_ADDRESS)
        .addTraces({
          function: wrongFunctionInterface.getFunction("wrongFunction"),
          to: REGISTRY_ADDRESS,
          from: FORTA_BOTS_ADDRESS,
          arguments: mockTxEventData1,
        });

      const findings = await handleTransaction(mockTxEvent);
      expect(findings).toStrictEqual([]);
    });
  });
});
