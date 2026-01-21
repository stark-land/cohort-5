import { useStarknet } from "../privy-starknet-provider";
import { contractAddress } from "../env";

export function AccountInfo() {
  const { address, balance, isDeployed } = useStarknet();

  if (!address) {
    return null;
  }

  return (
    <div className="account-info">
      <div className="wallet-details">
        <div className="contract-row">
          <span className="label">Contract:</span>
          <a
            href={`https://sepolia.voyager.online/contract/${contractAddress}`}
            target="_blank"
            rel="noreferrer"
            className="value underline"
          >
            {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
          </a>
        </div>
        <div className="wallet-row">
          <span className="label">Account:</span>
          <a
            href={`https://sepolia.voyager.online/contract/${address}`}
            target="_blank"
            rel="noreferrer"
            className="value underline"
          >
            {address.slice(0, 6)}...{address.slice(-4)}
          </a>
        </div>
        <div className="wallet-row">
          <span className="label">Deployed:</span>
          <span className={`value ${isDeployed ? "deployed" : "not-deployed"}`}>
            {isDeployed ? "Yes" : "No"}
          </span>
        </div>
        <div className="wallet-row">
          <span className="label">Balance:</span>
          <span className="value">{balance?.strk || "0"} STRK</span>
        </div>
      </div>
      <style>
        {`
        .account-info {
          margin-top: 20px;
          margin-bottom: 20px;
          padding: 20px;
          background: rgba(196, 170, 170, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .account-info h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .account-info .wallet-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .account-info .wallet-row,
        .account-info .contract-row {
          display: flex;
          gap: 8px;
          font-size: 14px;
        }
        
        .account-info .label {
          font-weight: 500;
        }
        
        .account-info .value {
          user-select: text;
          font-family: monospace;
        }
        
        .account-info .underline {
          text-decoration: underline;
        }
      `}
      </style>
    </div>
  );
}
