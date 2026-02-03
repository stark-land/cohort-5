import { useStarknet } from "../privy-starknet-provider";
import { useCounter } from "../hooks/useCounter";
import { toast } from "sonner";
import { contractAddress } from "../env";

export function Counter() {
  const { counter } = useCounter();
  const { address, executeGaslessTransaction } = useStarknet();

  const handleIncrementGasless = async () => {
    const transactionPromise = async () => {
      const result = await executeGaslessTransaction([
        {
          contractAddress,
          entrypoint: "increment",
          calldata: [],
        },
      ]);

      if (!result.success) {
        throw new Error(result.error || "Transaction failed");
      }

      return result;
    };

    toast.promise(transactionPromise(), {
      loading: "Transaction pending...",
      success: (data) => {
        const txUrl = `https://sepolia.voyager.online/tx/${data.transactionHash}`;
        return (
          <span>
            Transaction confirmed! View tx:{" "}
            <a
              className="underline"
              href={txUrl}
              target="_blank"
              rel="noreferrer"
            >
              {data.transactionHash.slice(0, 10)}…
            </a>
          </span>
        );
      },
      error: (err) => err.message || "Transaction failed",
    });
  };

  if (!address) {
    return null;
  }

  return (
    <button
      onClick={handleIncrementGasless}
      className="counter-button"
    >
      <h1>{counter}</h1>
    </button>
  );
}
