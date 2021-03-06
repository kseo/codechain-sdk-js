import { Buffer } from "buffer";

import { H256 } from "../core/H256";
import { AssetTransferTransaction, TransactionBurnSigner } from "../core/transaction/AssetTransferTransaction";
import { Script } from "../core/Script";

import { AssetTransferAddress } from "./AssetTransferAddress";
import { KeyStore } from "./KeyStore";

type NetworkId = string;

export class P2PKHBurn implements TransactionBurnSigner {
    private keyStore: KeyStore;
    private networkId: NetworkId;

    constructor(params: { keyStore: KeyStore, networkId: NetworkId }) {
        const { keyStore, networkId } = params;
        this.keyStore = keyStore;
        this.networkId = networkId;
    }

    async createAddress(): Promise<AssetTransferAddress> {
        const publicKey = await this.keyStore.createKey();
        const publicKeyHash = await this.keyStore.addPKH({ publicKey });
        return AssetTransferAddress.fromTypeAndPayload(2, publicKeyHash, { networkId: this.networkId });
    }

    async signBurn(transaction: AssetTransferTransaction, index: number): Promise<void> {
        if (index >= transaction.burns.length) {
            throw Error("Invalid input index");
        }
        const { lockScriptHash, parameters } = transaction.burns[index].prevOut;
        if (lockScriptHash === undefined || parameters === undefined) {
            throw Error("Invalid transaction input");
        }
        console.log(lockScriptHash);
        console.log(P2PKHBurn.getLockScriptHash().value);
        if (lockScriptHash.value !== P2PKHBurn.getLockScriptHash().value) {
            throw Error("Unexpected lock script hash");
        }
        if (parameters.length !== 1) {
            throw Error("Unexpected length of parameters");
        }
        const publicKeyHash = Buffer.from(parameters[0]).toString("hex");
        const publicKey = await this.keyStore.getPK({ hash: publicKeyHash });
        if (!publicKey) {
            throw Error(`Unable to get original key from the given public key hash: ${publicKeyHash}`);
        }

        transaction.burns[index].setLockScript(P2PKHBurn.getLockScript());
        transaction.burns[index].setUnlockScript(await this.getUnlockScript(publicKey, transaction.hashWithoutScript()));
    }

    private async getUnlockScript(publicKey: string, txhash: H256): Promise<Buffer> {
        const signature = await this.keyStore.sign({ publicKey, message: txhash.value });
        const { PUSHB } = Script.Opcode;
        return Buffer.from([
            PUSHB,
            65,
            ...Buffer.from(signature, "hex"),
            PUSHB,
            64,
            ...Buffer.from(publicKey, "hex")
        ]);
    }

    static getLockScript(): Buffer {
        const { COPY, BLAKE256, EQ, JZ, CHKSIG, BURN } = Script.Opcode;
        return Buffer.from([COPY, 0x01, BLAKE256, EQ, JZ, 0xFF, CHKSIG, JZ, 0xFF, BURN]);
    }

    static getLockScriptHash(): H256 {
        return new H256("41a872156efc1dbd45a85b49896e9349a4e8f3fb1b8f3ed38d5e13ef675bcd5a");
    }
}
