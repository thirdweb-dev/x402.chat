import { toWei } from "thirdweb";
import type { ERC20TokenAmount } from "thirdweb/x402";
import { tokenAddress } from "@/lib/constants";

const BASE_UNIT_PRICE = toWei("1");

export function getDynamicPrice(replyCount: number): ERC20TokenAmount {
  return {
    amount: (BASE_UNIT_PRICE * BigInt(replyCount + 1)).toString(),
    asset: {
      address: tokenAddress,
      decimals: 18,
      eip712: {
        name: "x402.chat",
        version: "1",
        primaryType: "Permit",
      },
    },
  };
}
