// Chains
export enum Chain {
  BASE_MAINNET = 8453,
  BASE_GOERLI = 84531
}

// Exchange contract addresses
export const EXCHANGE_ROUTER = {
  [Chain.BASE_MAINNET]: "0x8160C59218be97F301a857cD8E72e5d3446621df",
  [Chain.BASE_GOERLI]: "0xd6351CC74A04F9472dFBA0b5601d5Bb0d93F4E22"
};

// RPCs
export const RPCs = {
  [Chain.BASE_GOERLI]: "https://goerli.base.org",
  [Chain.BASE_MAINNET]: "https://mainnet.base.org"
};
