import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CarbonBazaar } from "../target/types/carbon_bazaar";
import { expect } from "chai";

describe("carbon-bazaar", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.CarbonBazaar as Program<CarbonBazaar>;

    it("setup marketplace", async () => {
        const marketplaceKeypair = anchor.web3.Keypair.generate();
        const owner = provider.wallet;
        const feePercentage = 5;
        await program.methods
            .setupMarketplace(feePercentage)
            // the `systemProgram` can be inferred from the context and doesn't need to be specified
            .accounts({
                marketplace: marketplaceKeypair.publicKey,
                owner: owner.publicKey,
            })
            // the `owner` is the program provider so it signs automatically by default
            .signers([marketplaceKeypair])
            .rpc();

        let marketplaceState = await program.account.marketplace.fetch(
            marketplaceKeypair.publicKey
        );
        expect(marketplaceState.owner).to.eql(owner.publicKey);
        expect(marketplaceState.settings.feePercentage).to.equal(feePercentage);
    });
});
