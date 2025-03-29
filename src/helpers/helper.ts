import {
    AptosConfig,
    PendingTransactionResponse,
    Network,
    Aptos,
    AnyRawTransaction,
    AccountAuthenticator,
    AccountAddress,
    Deserializer,
  } from "@aptos-labs/ts-sdk";
import { apiKey, aptosNetwork } from "./constants";
import "dotenv/config";
import { ApiResponse } from "@kanalabs/paymaster-sdk";

export function getBaseUrl(paymasterUrl: string) {
    return paymasterUrl;
  }
  
export function getCommonHeaders(paymasterApikey: string) {
    return {
      "Content-Type": "application/json",
      "api-key": paymasterApikey,
      network: aptosNetwork,
    };
  }


  export async function isWhitelisted(args: { address?: string }): Promise<ApiResponse> {
    const url = "https://paymaster.kanalabs.io/isWhitelisted"
    const query: any = { address: args?.address }
    const params = new URLSearchParams(query).toString()
    const headers = getCommonHeaders(apiKey)
    try {
      const response = await fetch(`${url}?${params}`, { headers, method: 'GET' })
      if (response.status >= 400) {
        await response.json().then((data) => {
          throw new Error(data?.error || data?.message || 'Error in checking whitelist status.')
        })
      }
      return await response.json()
    } catch (error: any) {
      throw error?.data || error
    }
  }

  export async function addToWhitelist(args: { address?: string }): Promise<ApiResponse> {
    const url = "https://paymaster.kanalabs.io/addToWhitelist"
    const query: any = { user_address: args?.address }
    const params = new URLSearchParams(query).toString()

    const headers = getCommonHeaders(apiKey)
    try {
      const response = await fetch(`${url}?${params}`, { headers, method: 'GET' })
      if (response.status >= 400) {
        await response.json().then((data) => {
          throw new Error(data?.error || data?.message || 'Error in adding user to whitelist.')
        })
      }
      return await response.json()
    } catch (error: any) {
      throw error?.data || error
    }
  }


  export async function sponsoredTxnWithSenderAuth(args: {
    transaction: AnyRawTransaction;
    senderAuth: AccountAuthenticator;
    additionalAuthenticators?: AccountAuthenticator[];
    additionalAddresses?: AccountAddress[];
  }): Promise<PendingTransactionResponse> {
    const {
      transaction,
      senderAuth,
      additionalAuthenticators,
      additionalAddresses,
    } = args;
    try {
      const config = new AptosConfig({ network: Network.TESTNET });
      const aptosClient = new Aptos(config);
      const rawTransactionBytes = transaction.rawTransaction.bcsToBytes();
      const url = `${getBaseUrl("https://paymaster.kanalabs.io")}/sponsorGas`;
      const headers = getCommonHeaders(apiKey);
      const requestBody: { data: Uint8Array; additionalSigners?: string[] } = {
        data: rawTransactionBytes,
      };
  
      if (additionalAuthenticators && additionalAddresses) {
        if (additionalAuthenticators.length !== additionalAddresses.length) {
          throw new Error(
            "Number of additional Authenticators and Addresses mismatch"
          );
        }
        requestBody.additionalSigners = additionalAddresses.map((address) =>
          address.toString()
        );
      }
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });
  
      if (response.status >= 400) {
        const errorData = await response.json();
        throw new Error(
          errorData?.error ||
            errorData?.message ||
            "Error in sponsoring transaction."
        );
      }
      const responseData = await response.json();
      const feePayerAddress = responseData.feePayerAddress;
      const feepayerSignature = new Uint8Array(
        Object.values(responseData.feePayerAuth)
      );
      const deserializerFeePayer = new Deserializer(feepayerSignature);
      const feepayerAuth = AccountAuthenticator.deserialize(deserializerFeePayer);
      if (additionalAuthenticators && additionalAddresses) {
        return await aptosClient.transaction.submit.multiAgent({
          transaction: {
            rawTransaction: transaction.rawTransaction,
            feePayerAddress: AccountAddress.fromString(feePayerAddress),
            secondarySignerAddresses: additionalAddresses,
          } as AnyRawTransaction,
          senderAuthenticator: senderAuth,
          feePayerAuthenticator: feepayerAuth,
          additionalSignersAuthenticators: additionalAuthenticators,
        });
      } else {
        // For simple transaction
        return await aptosClient.transaction.submit.simple({
          transaction: {
            rawTransaction: transaction.rawTransaction,
            feePayerAddress: AccountAddress.fromString(feePayerAddress),
          } as AnyRawTransaction,
          senderAuthenticator: senderAuth,
          feePayerAuthenticator: feepayerAuth,
        });
      }
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  }