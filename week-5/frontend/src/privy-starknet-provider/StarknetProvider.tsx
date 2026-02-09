import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePrivy } from "@privy-io/react-auth";
import type { PaymasterOptions } from "starknet";
import { Account, CallData, ec } from "starknet";
import type {
  BalanceInfo,
  StarknetContext as StarknetContext0,
  StarknetProviderConfig,
  TransactionResult,
} from "./types";
import {
  ARGENTX_CLASS_HASH,
  checkAccountDeployment,
  createStarknetAccount,
  createStarknetProvider,
  derivePrivateKey,
  fetchBalances,
  generateDeploymentData,
} from "./utils";

export const StarknetContext = createContext<StarknetContext0 | null>(null);

interface StarknetProviderProps {
  children: ReactNode;
  config: StarknetProviderConfig;
}

export function StarknetProvider({ children, config }: StarknetProviderProps) {
  const { user } = usePrivy();

  const [account, setAccount] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [isDeployed, setIsDeployed] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize Starknet account when Privy user is logged in
  useEffect(() => {
    if (user) {
      initialize();
    } else {
      // Reset state when user logs out
      setAccount(null);
      setProvider(null);
      setAddress(null);
      setPrivateKey(null);
      setBalance(null);
      setIsDeployed(false);
      setError(null);
    }
  }, [user]);

  // Auto-refresh balance every 10 seconds when account exists
  useEffect(() => {
    if (account && provider) {
      const interval = setInterval(() => {
        refreshBalance();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [account, provider]);

  const initialize = async () => {
    if (!user || !config.rpcUrl) {
      setError("Missing user or RPC URL");
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      // Create Starknet provider
      const starknetProvider = createStarknetProvider(config.rpcUrl);

      // Derive deterministic private key from Privy user ID
      const userSeed = user.id;
      const derivedPrivateKey = await derivePrivateKey(userSeed);

      // Create Starknet account
      const starknetAccount = createStarknetAccount(
        derivedPrivateKey,
        starknetProvider,
      );

      // Set state
      setProvider(starknetProvider);
      setAccount(starknetAccount);
      setAddress(starknetAccount.address);
      setPrivateKey(derivedPrivateKey);

      // Fetch initial balance and deployment status
      const balances = await fetchBalances(
        starknetProvider,
        starknetAccount.address,
      );
      setBalance(balances);

      const deploymentStatus = await checkAccountDeployment(
        starknetProvider,
        starknetAccount.address,
      );
      setIsDeployed(deploymentStatus.isDeployed);
    } catch (err: any) {
      console.error("Failed to initialize Starknet account:", err);
      setError(err.message || "Failed to initialize Starknet account");
    } finally {
      setIsInitializing(false);
    }
  };

  const refreshBalance = async () => {
    if (!provider || !address) return;

    try {
      const balances = await fetchBalances(provider, address);
      setBalance(balances);
    } catch (err: any) {
      console.error("Failed to refresh balance:", err);
    }
  };

  const deployAccount = async (): Promise<TransactionResult> => {
    if (!account || !provider || !privateKey) {
      return {
        transactionHash: "",
        success: false,
        error: "Account not initialized",
      };
    }

    setTxPending(true);
    setError(null);

    try {
      console.log("🚀 Deploying Starknet account...");

      const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
      const constructorCalldata = CallData.compile({
        owner: starkKeyPub,
        guardian: "0x0",
      });

      const { transaction_hash } = await account.deployAccount({
        classHash: ARGENTX_CLASS_HASH,
        constructorCalldata,
        addressSalt: starkKeyPub,
        contractAddress: account.address,
      });
      setTxHash(transaction_hash);

      console.log("📡 Waiting for deployment confirmation...");
      await provider.waitForTransaction(transaction_hash);

      console.log("✅ Account deployed successfully!");
      setIsDeployed(true);

      // Refresh balance after deployment
      await refreshBalance();

      return { transactionHash: transaction_hash, success: true };
    } catch (err: any) {
      const errorMsg = err.message || "Failed to deploy account";
      console.error("Deployment failed:", errorMsg);
      setError(errorMsg);
      return { transactionHash: "", success: false, error: errorMsg };
    } finally {
      setTxPending(false);
      setTxHash(null);
    }
  };

  const executeGaslessTransaction = async (
    calls: any[],
  ): Promise<TransactionResult> => {
    if (!account || !provider || !privateKey) {
      return {
        transactionHash: "",
        success: false,
        error: "Account not initialized",
      };
    }

    if (!config.avnuApiKey) {
      return {
        transactionHash: "",
        success: false,
        error:
          "AVNU API key is required. Please add VITE_AVNU_API_KEY to your .env file.",
      };
    }

    setTxPending(true);
    setError(null);

    try {
      console.log("🚀 Executing gasless transaction with AVNU Paymaster...");
      console.log("Account address:", account.address);

      // Check if account is deployed
      const deploymentStatus = await checkAccountDeployment(
        provider,
        account.address,
      );
      console.log("Account deployed:", deploymentStatus.isDeployed);

      // Create account with paymaster configured
      const paymasterOptions: PaymasterOptions = {
        nodeUrl: "https://sepolia.paymaster.avnu.fi",
        headers: {
          "x-paymaster-api-key": config.avnuApiKey,
        },
      };

      // Create new account instance with paymaster
      const paymasterAccount = new Account({
        provider,
        address: account.address,
        signer: privateKey,
        paymaster: paymasterOptions,
      });

      // Prepare paymaster details
      // Use 'sponsored' mode so paymaster pays for all gas fees
      const paymasterDetails: any = {
        feeMode: { mode: "sponsored" },
      };

      if (!deploymentStatus.isDeployed) {
        const deploymentData = generateDeploymentData(privateKey);
        paymasterDetails.deploymentData = {
          address: account.address,
          class_hash: deploymentData.class_hash,
          salt: deploymentData.salt,
          unique: deploymentData.unique,
          calldata: deploymentData.calldata,
          version: 1,
        };
        console.log(
          "Including deployment data for undeployed account (sponsored mode)",
        );
      }

      console.log("Estimating fees with paymaster...");
      const estimatedFees = await paymasterAccount
        .estimatePaymasterTransactionFee(calls, paymasterDetails);
      console.log("Estimated fees:", estimatedFees);

      console.log("Executing transaction...");
      const result = await paymasterAccount.executePaymasterTransaction(
        calls,
        paymasterDetails,
        estimatedFees.suggested_max_fee_in_gas_token,
      );
      setTxHash(result.transaction_hash);

      console.log("📡 Waiting for transaction confirmation...");
      await provider.waitForTransaction(result.transaction_hash);

      console.log("✅ Gasless transaction confirmed!");

      // Update deployment status if account wasn't deployed
      if (!deploymentStatus.isDeployed) {
        setIsDeployed(true);
      }

      // Refresh balance after transaction
      await refreshBalance();

      return { transactionHash: result.transaction_hash, success: true };
    } catch (err: any) {
      console.error("Paymaster error:", err);
      console.error("Error message:", err.message);

      let errorMsg = err.message || "Gasless transaction failed";

      // Provide helpful error messages
      if (errorMsg.includes("401")) {
        errorMsg =
          "AVNU API key is invalid or expired. Get a new key at https://docs.avnu.fi";
      } else if (errorMsg.includes("403")) {
        errorMsg =
          "AVNU API key does not have permission for paymaster transactions";
      } else if (errorMsg.includes("429")) {
        errorMsg = "AVNU rate limit exceeded. Please try again later.";
      }

      console.error("Gasless transaction error:", errorMsg);
      setError(errorMsg);
      return { transactionHash: "", success: false, error: errorMsg };
    } finally {
      setTxPending(false);
      setTxHash(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue: StarknetContext0 = {
    account,
    provider,
    address,
    privateKey,
    balance,
    isDeployed,
    isInitializing,
    txPending,
    txHash,
    error,
    initialize,
    refreshBalance,
    deployAccount,
    executeGaslessTransaction,
    clearError,
  };

  return (
    <StarknetContext.Provider value={contextValue}>
      {children}
    </StarknetContext.Provider>
  );
}
