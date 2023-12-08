// import {
//   FindingType,
//   FindingSeverity,
//   Finding,
//   HandleTransaction,
//   createTransactionEvent,
//   ethers,
//   TransactionEvent,
// } from "forta-agent";
// import agent, {
//   CREATE_AGENT_EVENT_ABI,
//   FORTA_BOTS_ADDRESS,
//   REGISTRY_ADDRESS,
// } from "./agent";
// import { TestTransactionEvent } from "forta-agent-tools/lib/test";

// describe("Forta Bot Deployment Agent", () => {
//   let handleTransaction: HandleTransaction;

//   beforeAll(() => {
//     handleTransaction = agent.handleTransaction;
//   });

//   describe("handleTransaction", () => {
//     // let mockTxEvent: TransactionEvent = new TestTransactionEvent();
//     it("returns empty findings if there are no bot deployments", async () => {
//       let mockTxEvent: TransactionEvent = new TestTransactionEvent();
//       const findings = await handleTransaction(mockTxEvent);
//       expect(findings).toStrictEqual([]);
//     });

//     it("returns empty findings if the deployment address is wrong", async () => {
//       let mockTxEvent: TransactionEvent = new TestTransactionEvent()
//         .setFrom(FORTA_BOTS_ADDRESS)
//         .setTo(REGISTRY_ADDRESS)
//         .addTraces();
//       const findings = await handleTransaction(mockTxEvent);
//       expect(findings).toStrictEqual([]);
//     });

//     it("returns empty findings if the registry address is wrong", async () => {
//       let mockTxEvent: TransactionEvent = new TestTransactionEvent()
//         .setFrom(FORTA_BOTS_ADDRESS)
//         .setTo(REGISTRY_ADDRESS)
//         .addTraces();
//       const findings = await handleTransaction(mockTxEvent);
//       expect(findings).toStrictEqual([]);
//     });

//     it("returns empty findings if the function ABI is wrong", async () => {
//         let mockTxEvent: TransactionEvent = new TestTransactionEvent()
//           .setFrom(FORTA_BOTS_ADDRESS)
//           .setTo(REGISTRY_ADDRESS)
//           .addTraces();
//         const findings = await handleTransaction(mockTxEvent);
//         expect(findings).toStrictEqual([]);
//       });

//     it("returns all findings if there are multiple deployments", async () => {
//         let mockTxEvent: TransactionEvent = new TestTransactionEvent()
//           .setFrom(FORTA_BOTS_ADDRESS)
//           .setTo(REGISTRY_ADDRESS)
//           .addTraces();
//         const findings = await handleTransaction(mockTxEvent);
//         expect(findings).toStrictEqual([]);
//       });

//     // it("returns empty findings if there are no bot deployments", async () => {

//     //     const findings = await handleTransaction(mockTxEvent);
//     //     expect(findings).toStrictEqual([]);
//     //   });
//   });
// });
