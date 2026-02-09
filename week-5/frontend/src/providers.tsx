import type { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { StarknetProvider } from "./privy-starknet-provider";
import { Toaster } from "sonner";
import { useLocalStorage } from "@uidotdev/usehooks";
import {
  avnuApiKey as envAvnuApiKey,
  privyAppId,
  privyClientId,
  rpcUrl,
} from "./env";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [avnuApiKey] = useLocalStorage<string>(
    "avnuApiKey",
    "",
  );

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
          avnuApiKey: avnuApiKey || envAvnuApiKey,
        }}
      >
        {children}
        <Toaster position="bottom-right" theme="dark" />
      </StarknetProvider>
    </PrivyProvider>
  );
}
