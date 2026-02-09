import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWrench } from "@fortawesome/free-solid-svg-icons";
import "./SettingsButton.css";

export function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useLocalStorage<string>(
    "avnuApiKey",
    "",
  );
  const [inputValue, setInputValue] = useState(apiKey || "");

  const handleSave = () => {
    setApiKey(inputValue);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => {
          setInputValue(apiKey || "");
          setIsOpen(true);
        }}
        className="settings-button"
        aria-label="Settings"
      >
        <FontAwesomeIcon icon={faWrench} className="settings-icon" />
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        style={{ position: "relative", zIndex: 50 }}
      >
        <div className="settings-backdrop" aria-hidden="true" />

        <div className="settings-dialog-container">
          <DialogPanel className="settings-dialog-panel">
            <DialogTitle className="settings-title">Settings</DialogTitle>

            <div>
              <label htmlFor="apiKey" className="settings-label">
                Custom Avnu API Key (Sepolia)
              </label>
              <input
                id="apiKey"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Optional, default to VITE_AVNU_API_KEY"
                className="settings-input"
              />
            </div>

            <div className="settings-button-group">
              <button
                onClick={() => setIsOpen(false)}
                className="settings-cancel-button"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="settings-save-button">
                Save
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
