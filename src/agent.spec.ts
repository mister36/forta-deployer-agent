import {
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction,
  createTransactionEvent,
} from "forta-agent";
import agent from "./agent";
import { ERC721_ADDRESS, NETHERMIND_ADDRESS, CREATE_AGENT } from "./constants";

describe("Forta deployer agent", () => {
  let handleTransaction: HandleTransaction;

  const createTxEvent = (from: string) =>
    createTransactionEvent({
      transaction: { from } as any,
      logs: [],
      contractAddress: null,
      block: {} as any,
    });

  beforeAll(() => {
    handleTransaction = agent.handleTransaction;
  });

  it("returns no findings if there are no createAgent function calls", async () => {
    const txEvent = createTxEvent(NETHERMIND_ADDRESS.toLowerCase());
    txEvent.filterFunction = jest.fn().mockReturnValueOnce([]);

    const findings = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([]);
    expect(txEvent.filterFunction).toHaveBeenCalledWith(
      CREATE_AGENT,
      ERC721_ADDRESS
    );
  });

  it("returns no findings if there are createAgent function calls, but they aren't from Nethermind", async () => {
    const txEvent = createTxEvent("0xabc");

    const mockCreateAgentFunction = {
      args: {
        agentId: "0x123",
        owner: "0x45a",
        metadata: "random",
        chainIds: [12, 34, 54],
      },
    };

    txEvent.filterFunction = jest
      .fn()
      .mockReturnValueOnce([mockCreateAgentFunction]);

    const findings = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([]);
  });

  it("returns findings if there are createAgent function calls from Nethermind", async () => {
    const txEvent = createTxEvent(NETHERMIND_ADDRESS.toLowerCase());

    const mockCreateAgentFunction = {
      args: {
        agentId: "0x123",
        owner: "0x45a",
        metadata: "random",
        chainIds: [12, 34, 54],
      },
    };

    txEvent.filterFunction = jest
      .fn()
      .mockReturnValueOnce([mockCreateAgentFunction]);

    const findings = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: "Agent Deployment",
        description:
          "A new agent was deployed on Nethermind's Forta deployer address",
        alertId: "DEPLOY",
        type: FindingType.Info,
        severity: FindingSeverity.Info,
      }),
    ]);
    expect(txEvent.filterFunction).toHaveBeenCalledTimes(1);
    expect(txEvent.filterFunction).toHaveBeenCalledWith(
      CREATE_AGENT,
      ERC721_ADDRESS
    );
  });
});
