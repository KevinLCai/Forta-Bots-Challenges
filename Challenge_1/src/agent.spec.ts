import {
  FindingType,
  FindingSeverity,
  HandleTransaction,
  TransactionEvent,
} from "forta-agent";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { createAddress } from "forta-agent-tools";
import { Interface } from "@ethersproject/abi";
import { provideHandleTransaction } from "./agent";

describe("Forta Bot Deployment Agent", () => {
  let handleTransaction: HandleTransaction;

  const mockCreateAgentEventData = [
    1,
    createAddress("0x01"),
    "Mock tx 1",
    [137],
  ];
  const mockCreateAgentEventData2 = [
    1,
    createAddress("0x02"),
    "Mock tx 2",
    [137],
  ];
  const mockUpdateAgentEventData = [1, "Mock tx 2", [137]];

  const MOCK_BOT_REGISTRY_ADDRESS =
    "0x61447385B019187daa48e91c55c02AF1F1f3F863";
  const MOCK_NETHERMIND_DEPLOYER_ADDRESS =
    "0x88dc3a2284fa62e0027d6d6b1fcfdd2141a143b8";

  const MOCK_CREATE_AGENT_EVENT_ABI =
    "function createAgent(uint256 agentId,address ,string metadata,uint256[] chainIds)";
  const MOCK_UPDATE_AGENT_EVENT_ABI =
    "function updateAgent(uint256 agentId,string metadata,uint256[] chainIds)";
  const WRONG_FUNCTION_ABI =
    "function wrongFunction(uint256 agentId,address ,string metadata,uint256[] chainIds)";

  beforeAll(() => {
    handleTransaction = provideHandleTransaction(
      MOCK_CREATE_AGENT_EVENT_ABI,
      MOCK_UPDATE_AGENT_EVENT_ABI,
      MOCK_BOT_REGISTRY_ADDRESS,
      MOCK_NETHERMIND_DEPLOYER_ADDRESS
    );
  });

  describe("handleTransaction", () => {
    const provideInterface = new Interface([
      MOCK_CREATE_AGENT_EVENT_ABI,
      MOCK_UPDATE_AGENT_EVENT_ABI,
      WRONG_FUNCTION_ABI,
    ]);
    const wrongAddress = createAddress("0x00");

    it("returns finding if there is one bot deployment", async () => {
      let mockTxEvent: TransactionEvent = new TestTransactionEvent()
        .setTo(MOCK_BOT_REGISTRY_ADDRESS)
        .setFrom(MOCK_NETHERMIND_DEPLOYER_ADDRESS)
        .addTraces({
          function: provideInterface.getFunction("createAgent"),
          to: MOCK_BOT_REGISTRY_ADDRESS,
          from: MOCK_NETHERMIND_DEPLOYER_ADDRESS,
          arguments: mockCreateAgentEventData,
        });

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        expect.objectContaining({
          name: "Agent Created",
          description: "NM Agent Created",
          alertId: "NETHERMIND-1",
          protocol: "ethereum",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            createAgentEventAddress: MOCK_NETHERMIND_DEPLOYER_ADDRESS,
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
        .setTo(MOCK_BOT_REGISTRY_ADDRESS)
        .setFrom(MOCK_NETHERMIND_DEPLOYER_ADDRESS)
        .addTraces({
          function: provideInterface.getFunction("createAgent"),
          to: MOCK_BOT_REGISTRY_ADDRESS,
          from: MOCK_NETHERMIND_DEPLOYER_ADDRESS,
          arguments: mockCreateAgentEventData,
        })
        .addTraces({
          function: provideInterface.getFunction("createAgent"),
          to: MOCK_BOT_REGISTRY_ADDRESS,
          from: MOCK_NETHERMIND_DEPLOYER_ADDRESS,
          arguments: mockCreateAgentEventData2,
        });

      const findings = await handleTransaction(mockTxEvent);

      console.log("FINDINGS=========");
      console.log(findings);

      expect(findings).toStrictEqual([
        expect.objectContaining({
          name: "Agent Created",
          description: "NM Agent Created",
          alertId: "NETHERMIND-1",
          protocol: "ethereum",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            createAgentEventAddress: MOCK_NETHERMIND_DEPLOYER_ADDRESS,
          },
          addresses: [],
          labels: [],
          uniqueKey: "",
          source: {},
        }),
        expect.objectContaining({
          name: "Agent Created",
          description: "NM Agent Created",
          alertId: "NETHERMIND-1",
          protocol: "ethereum",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            createAgentEventAddress: MOCK_NETHERMIND_DEPLOYER_ADDRESS,
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
        .setTo(MOCK_BOT_REGISTRY_ADDRESS)
        .setFrom(MOCK_NETHERMIND_DEPLOYER_ADDRESS)
        .addTraces({
          function: provideInterface.getFunction("updateAgent"),
          to: MOCK_BOT_REGISTRY_ADDRESS,
          from: MOCK_NETHERMIND_DEPLOYER_ADDRESS,
          arguments: mockUpdateAgentEventData,
        })
        .addTraces({
          function: provideInterface.getFunction("createAgent"),
          to: MOCK_BOT_REGISTRY_ADDRESS,
          from: MOCK_NETHERMIND_DEPLOYER_ADDRESS,
          arguments: mockCreateAgentEventData,
        });

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        expect.objectContaining({
          name: "Agent Created",
          description: "NM Agent Created",
          alertId: "NETHERMIND-1",
          protocol: "ethereum",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            createAgentEventAddress: MOCK_NETHERMIND_DEPLOYER_ADDRESS,
          },
          addresses: [],
          labels: [],
          uniqueKey: "",
          source: {},
        }),
        expect.objectContaining({
          name: "Agent Update",
          description: "NM Agent Updated",
          alertId: "NETHERMIND-2",
          protocol: "ethereum",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            updateAgentEventAddress: MOCK_NETHERMIND_DEPLOYER_ADDRESS,
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
        .setTo(MOCK_BOT_REGISTRY_ADDRESS)
        .setFrom(wrongAddress)
        .addTraces({
          function: provideInterface.getFunction("createAgent"),
          to: MOCK_BOT_REGISTRY_ADDRESS,
          from: wrongAddress,
          arguments: mockCreateAgentEventData,
        });

      const findings = await handleTransaction(mockTxEvent);
      expect(findings).toStrictEqual([]);
    });

    it("returns empty findings if the registry address is wrong", async () => {
      let mockTxEvent: TransactionEvent = new TestTransactionEvent()
        .setTo(wrongAddress)
        .setFrom(MOCK_NETHERMIND_DEPLOYER_ADDRESS)
        .addTraces({
          function: provideInterface.getFunction("createAgent"),
          to: wrongAddress,
          from: MOCK_NETHERMIND_DEPLOYER_ADDRESS,
          arguments: mockCreateAgentEventData,
        });

      const findings = await handleTransaction(mockTxEvent);
      expect(findings).toStrictEqual([]);
    });

    it("returns empty findings if the function ABI is wrong", async () => {
      let mockTxEvent: TransactionEvent = new TestTransactionEvent()
        .setTo(MOCK_BOT_REGISTRY_ADDRESS)
        .setFrom(MOCK_NETHERMIND_DEPLOYER_ADDRESS)
        .addTraces({
          function: provideInterface.getFunction("wrongFunction"),
          to: MOCK_BOT_REGISTRY_ADDRESS,
          from: MOCK_NETHERMIND_DEPLOYER_ADDRESS,
          arguments: mockCreateAgentEventData,
        });

      const findings = await handleTransaction(mockTxEvent);
      expect(findings).toStrictEqual([]);
    });
  });
});
