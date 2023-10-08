use anchor_lang::prelude::*;

declare_id!("CLZYui5NQzCFABeiVHujBKzDpYYwb5wmBeGeNdSkkpjc");

#[program]
pub mod carbon_bazaar {
    use super::*;

    pub fn setup_marketplace(ctx: Context<SetupMarketplace>, fee_percentage: u8) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.owner = *ctx.accounts.owner.key;
        marketplace.settings = MarketplaceSettings::new(fee_percentage);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SetupMarketplace<'info> {
    #[account(init, payer = owner, space = 8 + Marketplace::MAXIMUM_SIZE)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Marketplace {
    pub owner: Pubkey,
    pub settings: MarketplaceSettings,
}

impl Marketplace {
    pub const MAXIMUM_SIZE: usize = 32 + MarketplaceSettings::MAXIMUM_SIZE;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct MarketplaceSettings {
    pub fee_percentage: u8,
}

impl MarketplaceSettings {
    pub const MAXIMUM_SIZE: usize = 1;

    pub fn new(fee_percentage: u8) -> Self {
        Self { fee_percentage }
    }
}

#[account]
pub struct Listing {
    pub nft: Pubkey,
    pub seller: Pubkey,
    pub price: u64,
}

impl Listing {
    pub const MAXIMUM_SIZE: usize = 32 + 32 + 8;
}

#[account]
pub struct Transaction {
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub nft: Pubkey,
    pub price: u64,
    pub fee: u64,
}

impl Transaction {
    pub const MAXIMUM_SIZE: usize = 32 + 32 + 32 + 8 + 8;
}
