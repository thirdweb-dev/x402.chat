import { base, mainnet } from "thirdweb/chains";
import {
  BASENAME_RESOLVER_ADDRESS,
  resolveAddress,
  resolveName,
} from "thirdweb/extensions/ens";
import { getAddress, isAddress } from "thirdweb/utils";
import { client } from "./thirdweb.client";

const nameToAddressCache = new Map<string, string | null>();
const addressToNameCache = new Map<string, string | null>();

export async function resolveENS(
  nameOrAddress: string,
): Promise<{ ensName: string | null; address: string | null }> {
  const lowerCaseNameOrAddress = nameOrAddress.toLowerCase();
  if (isAddress(lowerCaseNameOrAddress)) {
    const address = getAddress(lowerCaseNameOrAddress);
    let name: string | null = addressToNameCache.get(address) ?? null;

    if (!name) {
      try {
        name = await resolveName({
          client,
          address,
          resolverChain: mainnet,
        });
      } catch (error) {
        console.error("*** Error resolving name:", error);
        return {
          ensName: null,
          address: null,
        };
      }
      addressToNameCache.set(address, name);
    }
    return {
      ensName: name,
      address: address,
    };
  }

  let address: string | null =
    nameToAddressCache.get(lowerCaseNameOrAddress) ?? null;
  if (!address) {
    const [mainnetAddress, baseAddress] = await Promise.all([
      resolveAddress({
        client,
        name: lowerCaseNameOrAddress,
        resolverChain: mainnet,
      }).catch(() => {
        return null;
      }),
      resolveAddress({
        client,
        name: lowerCaseNameOrAddress,
        resolverAddress: BASENAME_RESOLVER_ADDRESS,
        resolverChain: base,
      }).catch(() => {
        return null;
      }),
    ]);
    address = mainnetAddress || baseAddress;
  }

  // if we are unable to resolve the address, return null
  if (!address) {
    return {
      ensName: null,
      address: null,
    };
  }

  if (address) {
    address = getAddress(address);
    nameToAddressCache.set(lowerCaseNameOrAddress, address);
    addressToNameCache.set(address, lowerCaseNameOrAddress);
  }

  return {
    ensName: lowerCaseNameOrAddress,
    address: address,
  };
}
