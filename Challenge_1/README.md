# Detect Newly Created or Updated Agents Deployed to the Network by Nethermind

## Description

This agent detects bots that are created or updated by Nethermind to the Forta Bot Registry.

## Supported Chains

- Polygon

## Alerts

- NETHERMIND-1

  - Fired when Nethermind address creates a new Forta Bot
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata includes: 
    - `createAgentEventAddress`: Nethermind Deployment Address

- NETHERMIND-2
  - Fired when Nethermind address updates a Forta Bot
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata includes: 
    - updateAgentEventAddress: Nethermind Deployment Address

## Test Data

The agent behaviour can be verified with the following transactions:

- [0xde22abc2fc0a02cfccb5d1fc43666fa227052e93a8dcdc5dd49f30bc363ee22e](https://polygonscan.com/tx/0xde22abc2fc0a02cfccb5d1fc43666fa227052e93a8dcdc5dd49f30bc363ee22e) (`updateAgent` function call)
