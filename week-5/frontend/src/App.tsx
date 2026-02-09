import "./App.css";

import { usePrivy } from "@privy-io/react-auth";
import { useStarknet } from "./privy-starknet-provider";
import { LoginButton } from "./components/LoginButton";
import { AccountInfo } from "./components/AccountInfo";
import { Counter } from "./components/Counter";
import { SettingsButton } from "./components/SettingsButton";

function App() {
  const { ready } = usePrivy();
  const { isInitializing } = useStarknet();

  if (!ready) {
    return <h1>Initializing Privy...</h1>;
  }

  if (isInitializing) {
    return <h1>Initializing Starknet...</h1>;
  }

  return (
    <>
      <SettingsButton />
      <Counter />
      <AccountInfo />
      <LoginButton />
    </>
  );
}

export default App;
