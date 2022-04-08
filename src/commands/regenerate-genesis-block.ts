import { Commands, Container } from "@solar-network/core-cli";
import { Blocks, Crypto, Identities, Interfaces, Managers, Transactions, Utils } from "@solar-network/crypto";
import { generateMnemonic } from "bip39";
import Joi from "joi";

@Container.injectable()
export class Command extends Commands.Command {
    public signature: string = "genesis:block:regenerate";
    public description: string = "Regenerates the genesis block";

    public configure(): void {
        this.definition
            // @ts-ignore
            .setFlag("passphrase", "Mnemonic (passphrase) of genesis wallet", Joi.string().required())
            // @ts-ignore
            .setFlag("network", "Network to use", Joi.string().default("mainnet"));
    }

    public async execute(): Promise<void> {
        const genesisBlock = await this.regenerateGenesisBlock();

        this.components.info(JSON.stringify(genesisBlock));
        this.components.warning(`New nethash is ${genesisBlock.payloadHash}`);
    }

    private async regenerateGenesisBlock(): Promise<any> {
        Managers.configManager.setFromPreset(this.getFlag("network"));

        const genesisBlock = this.getGenesisBlock();

        return this.signGenesisBlock(genesisBlock);
    }

    private getGenesisBlock(): any {
        const genesisBlock = Managers.configManager.get("genesisBlock");

        if (genesisBlock === null) {
            throw new Error(`No genesis block for network ${this.getFlag("network")} could be found`);
        }

        return genesisBlock;
    }

    private signGenesisBlock(genesisBlock: any): any {
        let payloadLength = 0;
        let totalFee: Utils.BigNumber = Utils.BigNumber.ZERO;
        let totalAmount: Utils.BigNumber = Utils.BigNumber.ZERO;
        const totalBytes: Buffer[] = [];
        const preminePassphrase = generateMnemonic();
        const keys: Interfaces.IKeyPair = Identities.Keys.fromPassphrase(preminePassphrase);
        const transactions: any[] = [];

        for (let transaction of genesisBlock.transactions) {
            transaction = Transactions.TransactionFactory.fromJson(transaction);

            if (transaction.data.typeGroup === 1 && transaction.data.type === 0) {
                const genesisAddress = Identities.Address.fromPassphrase(this.getFlag("passphrase"));
                const pubKeyHash: number = Managers.configManager.get<number>("network.pubKeyHash");

                if (genesisAddress === transaction.data.recipientId) {
                    transaction = Transactions.BuilderFactory.transfer()
                        .network(pubKeyHash)
                        .version(2)
                        .nonce("1")
                        .recipientId(genesisAddress)
                        .amount(transaction.data.amount)
                        .sign(preminePassphrase);

                    Object.assign(transaction.data, {
                        fee: Utils.BigNumber.ZERO,
                        timestamp: 0,
                    });
                    transaction.data.signature = Transactions.Signer.sign(transaction.data, keys);
                    transaction.data.id = Transactions.Utils.getId(transaction.data);
                }
            }

            const bytes: Buffer = Transactions.Serializer.getBytes(transaction.data);

            totalBytes.push(bytes);

            payloadLength += bytes.length;
            totalFee = totalFee.plus(transaction.data.fee);
            totalAmount = totalAmount.plus(Utils.BigNumber.make(transaction.data.amount));

            transactions.push(transaction.data);
        }

        genesisBlock.transactions = transactions;
        genesisBlock.totalAmount = totalAmount.toString();
        genesisBlock.totalFee = totalFee.toString();
        genesisBlock.numberOfTransactions = genesisBlock.transactions.length;
        genesisBlock.payloadHash = Crypto.HashAlgorithms.sha256(Buffer.concat(totalBytes)).toString("hex");
        genesisBlock.payloadLength = payloadLength;
        // @ts-ignore
        genesisBlock.generatorPublicKey = keys.publicKey.toString("hex");
        genesisBlock.id = Blocks.Block.getId(genesisBlock);

        const hash: Buffer = Crypto.HashAlgorithms.sha256(Blocks.Serializer.serialize(genesisBlock, false));

        genesisBlock.blockSignature = Crypto.Hash.signSchnorr(hash, keys);

        return genesisBlock;
    }
}
