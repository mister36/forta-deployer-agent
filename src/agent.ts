import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";

import { ERC721_ADDRESS, TRANSFER_EVENT } from "./constants";

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];

  const erc721Transfers = txEvent.filterLog(TRANSFER_EVENT, ERC721_ADDRESS);

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
