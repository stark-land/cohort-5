import { usePrivy } from "@privy-io/react-auth";

export function LoginButton() {
  const { login, logout, authenticated } = usePrivy();

  if (authenticated) {
    return (
      <button
        onClick={logout}
      >
        Logout
      </button>
    );
  }

  return (
    <div>
      <div className="test-account-card">
        <h3>Test Account</h3>
        <div className="wallet-details">
          <div className="wallet-row">
            <span className="label">Email:</span>
            <span className="value">test-4281@privy.io</span>
          </div>
          <div className="wallet-row">
            <span className="label">Phone number:</span>
            <span className="value">+1 555 555 9463</span>
          </div>
          <div className="wallet-row">
            <span className="label">OTP code:</span>
            <span className="value">348177</span>
          </div>
        </div>
      </div>
      <button
        onClick={login}
      >
        Connect Wallet
      </button>
      <style>
        {`
        .test-account-card {
          margin-bottom: 20px;
          padding: 20px;
          background: rgba(195, 172, 172, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .test-account-card h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .test-account-card .wallet-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .test-account-card .wallet-row {
          display: flex;
          gap: 8px;
          font-size: 14px;
        }
        
        .test-account-card .label {
          font-weight: 500;
        }
        
        .test-account-card .value {
          user-select: text;
          font-family: monospace;
        }
      `}
      </style>
    </div>
  );
}
