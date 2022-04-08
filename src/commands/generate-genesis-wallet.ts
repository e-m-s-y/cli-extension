import { Commands } from "@solar-network/core-cli";
import { Container } from "@solar-network/core-kernel";
import { Identities, Managers, Transactions } from "@solar-network/crypto";
import Joi from "joi";

@Container.injectable()
export class Command extends Commands.Command {
    public signature: string = "genesis:delegate:generate";
    public description: string = "Generate a self voting genesis delegate";

    public configure(): void {
        this.definition
            // @ts-ignore
            .setFlag("name", "Name of delegate", Joi.string().required())
            // @ts-ignore
            .setFlag("passphrase", "Mnemonic (passphrase) of delegate", Joi.string().required())
            // @ts-ignore
            .setFlag("network", "Network to use", Joi.string().default("mainnet"));
    }

    public async execute(): Promise<void> {
        Managers.configManager.setFromPreset(this.getFlag("network"));
        this.components.info(`Network '${this.getFlag("network")}' has been set`);

        const passphrase = this.getFlag("passphrase");
        const name = this.getFlag("name");
        const address = Identities.Address.fromPassphrase(passphrase);

        this.components.info(`Address: ${address}`);
        this.components.info(`Mnemonic: ${passphrase}`);
        this.components.info(`Delegate name: ${name}`);

        const transactions = [
            Transactions.BuilderFactory.delegateRegistration()
                .nonce("1")
                .usernameAsset(name)
                .fee("0")
                .timestamp(0)
                .sign(passphrase)
                .getStruct(),
            Transactions.BuilderFactory.vote()
                .nonce("2")
                .votesAsset([`+${Identities.PublicKey.fromPassphrase(passphrase)}`])
                .fee("0")
                .timestamp(0)
                .sign(passphrase)
                .getStruct(),
        ];

        this.components.info(JSON.stringify(transactions));
    }
}
