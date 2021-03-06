import { PlatformAddress } from "../../key/PlatformAddress";

export class SetShardOwners {
    public readonly shardId: number;
    public readonly owners: PlatformAddress[];
    constructor(params: { shardId: number, owners: PlatformAddress[] }) {
        const { shardId, owners } = params;
        this.shardId = shardId;
        this.owners = owners;
    }

    toEncodeObject(): Array<any> {
        const { shardId, owners } = this;
        return [5, shardId, owners.map(owner => owner.getAccountId().toEncodeObject())];
    }

    toJSON() {
        const { shardId, owners } = this;
        return {
            action: "setShardOwners",
            shardId,
            owners: owners.map(owner => owner.value)
        };
    }
}
