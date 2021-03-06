import { Buffer } from "buffer";

import { H256 } from "../H256";

export type AssetTransferOutputData = {
    lockScriptHash: H256;
    parameters: Buffer[];
    assetType: H256;
    amount: number;
};
/**
 * An AssetTransferOutput consists of:
 *  - A lock script hash and parameters, which mark ownership of the asset.
 *  - An asset type and amount, which indicate the asset's type and quantity.
 */
export class AssetTransferOutput {
    readonly lockScriptHash: H256;
    readonly parameters: Buffer[];
    readonly assetType: H256;
    readonly amount: number;

    /**
     * @param data.lockScriptHash A lock script hash of the output.
     * @param data.parameters Parameters of the output.
     * @param data.assetType An asset type of the output.
     * @param data.amount An asset amount of the output.
     */
    constructor(data: AssetTransferOutputData) {
        const { lockScriptHash, parameters, assetType, amount } = data;
        this.lockScriptHash = lockScriptHash;
        this.parameters = parameters;
        this.assetType = assetType;
        this.amount = amount;
    }

    /**
     * Convert to an object for RLP encoding.
     */
    toEncodeObject() {
        const { lockScriptHash, parameters, assetType, amount } = this;
        return [
            lockScriptHash.toEncodeObject(),
            parameters.map(parameter => Buffer.from(parameter)),
            assetType.toEncodeObject(),
            amount
        ];
    }

    /**
     * Create an AssetTransferOutput from an AssetTransferOutput JSON object.
     * @param data An AssetTransferOutput JSON object.
     * @returns An AssetTransferOutput.
     */
    static fromJSON(data: any) {
        const { lockScriptHash, parameters, assetType, amount } = data;
        return new this({
            lockScriptHash: new H256(lockScriptHash),
            parameters: parameters.map((p: Array<number>) => Buffer.from(p)),
            assetType: new H256(assetType),
            amount,
        });
    }

    /**
     * Convert to an AssetTransferOutput JSON object.
     * @returns An AssetTransferOutput JSON object.
     */
    toJSON() {
        const { lockScriptHash, parameters, assetType, amount } = this;
        return {
            lockScriptHash: lockScriptHash.value,
            parameters: parameters.map(parameter => [...parameter]),
            assetType: assetType.value,
            amount,
        };
    }

    /**
     * Get the shard ID.
     * @returns A shard ID.
     */
    shardId(): number {
        const { assetType } = this;
        return parseInt(assetType.value.slice(4, 8), 16);
    }
}
