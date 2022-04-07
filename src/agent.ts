import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";

import { ERC721_ADDRESS, NETHERMIND_ADDRESS, CREATE_AGENT } from "./constants";

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];

  if (txEvent.from !== NETHERMIND_ADDRESS.toLowerCase()) return findings;

  const erc721Transfers = txEvent.filterFunction(CREATE_AGENT, ERC721_ADDRESS);

  if (erc721Transfers.length === 0) return findings;

  findings.push(
    Finding.fromObject({
      name: "Agent Deployment",
      description:
        "A new agent was deployed on Nethermind's Forta deployer address",
      alertId: "DEPLOY",
      type: FindingType.Info,
      severity: FindingSeverity.Info,
    })
  );

  return findings;
};

export default {
  handleTransaction,
};
