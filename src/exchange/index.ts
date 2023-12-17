import { Contract } from "@ethersproject/contracts";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { Chain, EXCHANGE_ROUTER, RPCs } from "../constants";
import { Wallet } from "@ethersproject/wallet";
import assert from "assert";
import { BigNumber } from "bignumber.js";

interface ExchangeConfig {
  /**
   * The chain of execution. Defaults to Base mainnet.
   */
  chain?: Chain;
  /**
   * RPC url for network fallback. Falls back to default RPC that's selected using the indicated chain.
   */
  rpc?: string;
  /**
   * Private key to use if injected provider is not used or found.
   */
  privateKey?: string;
  /**
   * Whether to use injected provider. Won't work if running in a non-browser environment or no injected provider was found.
   */
  useInjected?: boolean;
}

interface FormattedOffer {
  amounts: BigNumber[];
  adapters: string[];
  path: string[];
  gasEstimate: BigNumber;
}

export class Exchange {
  contract: Contract;
  config: ExchangeConfig;

  constructor({ chain = Chain.BASE_MAINNET, rpc = RPCs[chain], privateKey = "", useInjected = false }: ExchangeConfig) {
    if (!useInjected || typeof window === "undefined" || !(<any>window).ethereum)
      assert.ok(
        !!privateKey && privateKey.trim().length > 0,
        "you must indicate a private key to use if useInjected = false, execution environment is node, or no ethereum provider is injected into browser window"
      );

    const provider =
      useInjected && typeof window !== "undefined" && !!(<any>window).ethereum
        ? new Web3Provider((<any>window).ethereum, chain)
        : new JsonRpcProvider(rpc, chain);
    const wallet =
      useInjected && typeof window !== "undefined" && !!(<any>window).ethereum
        ? provider.getSigner()
        : new Wallet(privateKey, provider);
    const contractAddress = EXCHANGE_ROUTER[chain];

    this.config = { chain, rpc, privateKey, useInjected };
    this.contract = new Contract(contractAddress, "", wallet);
  }

  /**
   *
   * @param tokenIn Sent token
   * @param tokenOut Received token
   * @param amountIn Amount to swap. Defaults to 1
   * @param maxSteps Maximum steps to take in composing path. Defaults to 2
   * @returns
   */
  async bestPath(
    tokenIn: string,
    tokenOut: string,
    amountIn: number = 1,
    maxSteps: number = 2
  ): Promise<FormattedOffer> {
    assert.ok(maxSteps < 5 && maxSteps > 0, "max steps must be greater than 0 and less than 5");

    const [amounts, adapters, path, gasEstimate] = await this.contract.findBestPath(
      `0x${amountIn.toString(16)}`,
      tokenIn,
      tokenOut,
      maxSteps
    );
    return { amounts, adapters, path, gasEstimate };
  }
}
