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

  describe("handleTransaction", () => {
    it("returns finding if there is one bot deployment", async () => {
      const createAgentInterface = new Interface([CREATE_AGENT_EVENT_ABI]);
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
          name: 'Forta TX',
          description: 'Forta contract tx',
          alertId: 'FORTA-1',
          protocol: 'ethereum',
          severity: 2,
          type: 4,
          metadata: {
            createAgentEventAddress: '0x88dc3a2284fa62e0027d6d6b1fcfdd2141a143b8'
          },
          addresses: [],
          labels: [],
          uniqueKey: '',
          source: {},
        }),
      ]);


    });

    // it("returns findings if there are multipe bot deployments", async () => {
    //   let mockTxEvent: TransactionEvent = new TestTransactionEvent();
    //   const findings = await handleTransaction(mockTxEvent);
    //   expect(findings).toStrictEqual([]);
    // });

    // it("returns empty findings if the deployment address is wrong", async () => {
    //   let mockTxEvent: TransactionEvent = new TestTransactionEvent()
    //     .setFrom(FORTA_BOTS_ADDRESS)
    //     .setTo(REGISTRY_ADDRESS)
    //     .addTraces();
    //   const findings = await handleTransaction(mockTxEvent);
    //   expect(findings).toStrictEqual([]);
    // });

    // it("returns empty findings if the registry address is wrong", async () => {
    //   let mockTxEvent: TransactionEvent = new TestTransactionEvent()
    //     .setFrom(FORTA_BOTS_ADDRESS)
    //     .setTo(REGISTRY_ADDRESS)
    //     .addTraces();
    //   const findings = await handleTransaction(mockTxEvent);
    //   expect(findings).toStrictEqual([]);
    // });

    // it("returns empty findings if the function ABI is wrong", async () => {
    //   let mockTxEvent: TransactionEvent = new TestTransactionEvent()
    //     .setFrom(FORTA_BOTS_ADDRESS)
    //     .setTo(REGISTRY_ADDRESS)
    //     .addTraces();
    //   const findings = await handleTransaction(mockTxEvent);
    //   expect(findings).toStrictEqual([]);
    // });
  });
});
