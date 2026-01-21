import type { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { StarknetProvider } from "./privy-starknet-provider";
import { ToastContainer } from "react-toastify";
import {
  avnuApiKey,
  contractAddress,
  privyAppId,
  privyClientId,
  rpcUrl,
} from "./env";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <PrivyProvider
      appId={privyAppId}
      clientId={privyClientId}
      config={{
        loginMethods: ["email", "sms"],
      }}
    >
      <StarknetProvider
        config={{
          rpcUrl,
          contractAddress,
          avnuApiKey,
        }}
      >
        {children}
        <ToastContainer
          position="bottom-right"
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
        />
      </StarknetProvider>
    </PrivyProvider>
  );
}
