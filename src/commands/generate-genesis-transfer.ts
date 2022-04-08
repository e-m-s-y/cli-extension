import { Commands } from "@solar-network/core-cli";
import { Container } from "@solar-network/core-kernel";
import { Identities, Managers, Transactions, Utils } from "@solar-network/crypto";
import Joi from "joi";

@Container.injectable()
export class Command extends Commands.Command {
    public signature: string = "genesis:transfer:generate";
    public description: string = "Generate a genesis transfer transaction";

    public configure(): void {
        this.definition
            // @ts-ignore
            .setFlag("recipientId", "Wallet address of recipient", Joi.string().required())
            // @ts-ignore
            .setFlag("passphrase", "Mnemonic (passphrase) of genesis wallet", Joi.string().required())
            // @ts-ignore
            .setFlag("network", "Network to use", Joi.string().default("mainnet"))
            // @ts-ignore
            .setFlag("amount", "Amount of the transaction", Joi.number().default(1))
            // @ts-ignore
            .setFlag("nonce", "Nonce of genesis wallet", Joi.number().default(0))
            // @ts-ignore
            .setFlag("fee", "Fee of the transaction", Joi.number().default(1));
    }

    public async execute(): Promise<void> {
        Managers.configManager.setFromPreset(this.getFlag("network"));
        this.components.info(`Network '${this.getFlag("network")}' has been set`);

        const passphrase = this.getFlag("passphrase");
        const genesisAddress = Identities.Address.fromPassphrase(passphrase);
        const address = this.getFlag("recipientId");
        const amount = this.getFlag("amount");

        this.components.info(`From address: ${genesisAddress}`);
        this.components.info(`To address: ${address}`);
        this.components.info(`Amount: ${amount}`);

        const nonce: Utils.BigNumber = new Utils.BigNumber(this.getFlag("nonce"));
        const transaction = Transactions.BuilderFactory.transfer()
            .nonce(nonce.toString())
            .amount(amount)
            .recipientId(address)
            .fee(this.getFlag("fee"))
            .timestamp(0)
            .sign(passphrase)
            .getStruct();

        this.components.info(JSON.stringify(transaction));
    }
}