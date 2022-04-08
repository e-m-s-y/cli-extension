import { Command as GenerateGenesisTransfer } from "./generate-genesis-transfer";
import { Command as GenerateGenesisWallet } from "./generate-genesis-wallet";
import { Command as RegenerateGenesisBlock } from "./regenerate-genesis-block";

export const Commands = [GenerateGenesisWallet, RegenerateGenesisBlock, GenerateGenesisTransfer];
