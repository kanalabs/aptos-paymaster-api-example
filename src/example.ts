import {
    AptosConfig,
    PendingTransactionResponse,
    UserTransactionResponse,
    Network,
    Aptos,
    Account,
  } from "@aptos-labs/ts-sdk";
  import { chainName, PaymasterSdk } from "@kanalabs/paymaster-sdk";
  import {
    TransactionOptions,
  } from "@kanalabs/paymaster-sdk/lib/interfaces";  
import { apiKey, aptosNetwork } from "./helpers/constants";
import { sponsoredTxnWithSenderAuth } from "./helpers/helper";
import "dotenv/config";
  
  const test = async () => {
    try {
      const config = new AptosConfig({ network: aptosNetwork as Network });
      const aptosClient = new Aptos(config);
      const payload: any = {
        function: "0x1::aptos_account::transfer_coins",
        functionArguments: [
          "0x0b4b8ef78fb296f89006f1936f01427a3a7e0eadd11dd4998c6bf438a0c8ce6b",
          0,
        ],
        typeArguments: ["0x1::aptos_coin::AptosCoin"],
      };
  
      const options: TransactionOptions = {
        gasUnitPrice: 100,
        maxGasAmount: 2000,
      };
  
      const sdk = new PaymasterSdk(
        {},
        {
          projectKey: apiKey,
          network: aptosNetwork as Network,
          chain: chainName.Aptos, // default aptos chain
        }
      );
  
      const senderAccount = Account.generate();
      console.log("senderAccount: ", senderAccount);
  
      const isWhitelisted = await sdk.isWhitelisted({
        address: senderAccount.accountAddress.toString(),
      });
      console.log("isWhitelisted: ", isWhitelisted);

  
      if (!(isWhitelisted.message == "whitelisted")) {
        console.log("not whitelisted");
        console.log(
          await sdk.addToWhitelist({
            address: senderAccount.accountAddress.toString(),
          })
        );
      }
      console.log(
        await sdk.initAccount({
          address: senderAccount.accountAddress.toString(),
        })
      );
  
      const transaction = await aptosClient.transaction.build.simple({
        sender: senderAccount.accountAddress.toString(),
        data: payload,
        options: options,
        withFeePayer: true,
      });
          console.log("transaction: ", transaction);
  
  
      const senderAuth = sdk.aptosClient.transaction.sign({
        signer: senderAccount,
        transaction: transaction,
      });
          console.log("senderAuth: ", senderAuth);
  
      const response = await sponsoredTxnWithSenderAuth({
        senderAuth: senderAuth,
        transaction: transaction,
      });
  
      console.log("response: ", response);
      if ((response as PendingTransactionResponse).hash) {
        const txnreceipt = (await sdk.aptosClient.waitForTransaction({
          transactionHash: (response as PendingTransactionResponse).hash,
          options: { checkSuccess: true },
        })) as UserTransactionResponse;
        console.log("txn status", txnreceipt.success);
      }
    } catch (error: any) {
      console.log("error", error);
    }
  }
  
  test();