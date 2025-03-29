# Aptos Paymaster Transaction API Example

This project demonstrates how to use sponsor transactions on the Aptos blockchain. It includes functionalities for checking whitelisting status, adding an address to the whitelist, and executing a gasless transaction using a paymaster service.

## 📌 Prerequisites

Ensure you have the following before running this project:

Node.js (v16+ recommended)

npm installed

Aptos account with a private key

Kana Labs Paymaster API Key

## 📂 Project Structure

```
/project-root
|─ src
│── helpers/
│   ├── constants.ts      # Stores API keys, network, and private key
│   ├── helper.ts         # Helper functions (whitelist checking, sponsoring transactions)
│── example.ts              # Main script
│── .env                  # Environment variables (optional)
│── package.json          # Dependencies
│── tsconfig.json         # TypeScript config
└── README.md             # Project documentation
```

## ⚙️ Setup

1️⃣ Install Dependencies
Run the following command to install required dependencies:

```
npm install
```

2️⃣ Configure Environment Variables
Create a .env file in the root directory and define the following:

```
APTOS_NETWORK=testnet or mainnet  # Change to testnet or mainnet if needed
API_KEY=your-kanalabs-api-key
PRIVATE_KEY=your-aptos-private-key
```

Alternatively, update helpers/constants.ts with the correct values.

## 🚀 Running the Script

Execute the script using:

```
npm run start
```

## 📜 How It Works

1. Initialize Aptos Client

   - Connects to the Aptos blockchain

   - Uses the Kana Labs Paymaster SDK for gasless transactions

2. Whitelisting Check

   - Verifies if the sender's address is whitelisted

   - If not whitelisted, adds the sender to the whitelist

3. Transaction Creation & Signing

   - Builds a transaction payload (Aptos coin transfer)

   - Signs the transaction with the sender’s private key

4. Sponsor the Transaction

   - Sends the signed transaction to the paymaster for sponsorship

5. Transaction Submission & Status Check

   - Submits the sponsored transaction to the blockchain

   - Waits for transaction confirmation

## 📌 Example Output
```
senderAccount: 0xabc123...  
isWhitelisted: { message: "not whitelisted" }  
Whitelisting user...  
transaction: { ...transaction payload... }  
senderAuth: { ...signed transaction data... }  
response: { hash: "0x123456789" }  
txn status true
```
## 🔗 References
Aptos SDK: https://github.com/aptos-labs/aptos-ts-sdk

Kana Labs Paymaster: https://docs.kanalabs.io/paymaster-service/kana-paymaster-for-aptos-and-supra

## 🛠️ Troubleshooting
### Common Issues & Fixes

> **Issue:** Invalid API Key  
> **Solution:** Ensure `APIKEY` is set correctly in `.env`.

> **Issue:** Sender not whitelisted  
> **Solution:** The script will automatically whitelist the sender.

> **Issue:** Transaction failed  
> **Solution:** Check if Aptos network is correct and if funds are sufficient.
