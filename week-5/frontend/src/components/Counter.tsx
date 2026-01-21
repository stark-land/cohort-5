import { useEffect, useState } from "react";
import { useStarknet } from "../privy-starknet-provider";
import { useCounter } from "../hooks/useCounter";
import { toast } from "react-toastify";
import { contractAddress } from "../env";

export function Counter() {
  const { counter } = useCounter();
  const { address, executeGaslessTransaction, txPending, txHash } =
    useStarknet();
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (txHash) {
      let txUrl = `https://sepolia.voyager.online/tx/${txHash}`;
      toast.success(
        <span>
          Transaction pending... View tx:{" "}
          <a
            className="underline"
            href={txUrl}
            target="_blank"
            rel="noreferrer"
          >
            {txHash.slice(0, 10)}…
          </a>
        </span>,
        { autoClose: 6000 },
      );
    }
  }, [txPending, txHash]);

  const handleIncrementGasless = async () => {
    const result = await executeGaslessTransaction([
      {
        contractAddress,
        entrypoint: "increment",
        calldata: [],
      },
    ]);

    if (result.success) {
      console.log("✅ Gasless transaction confirmed!");
    } else {
      toast.error(result.error, { autoClose: 5000 });
    }
  };

  if (!address) {
    return null;
  }

  return (
    <button
      onClick={handleIncrementGasless}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      style={{
        width: "160px",
        height: "160px",
        borderRadius: "50%",
        border: "2px solid rgba(188, 120, 120, 0.2)",
        background: isPressed
          ? "rgba(109, 91, 91, 0.2)"
          : "rgba(109, 91, 91, 0.05)",
        cursor: "pointer",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        transform: isPressed ? "scale(0.95)" : "scale(1)",
        transition: "transform 0.1s ease, background 0.1s ease",
      }}
    >
      <h1>{counter}</h1>
    </button>
  );
}
