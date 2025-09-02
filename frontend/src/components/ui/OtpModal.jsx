import React, { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";

const OtpModal = ({ isOpen, onVerify, onCancel, loading, error }) => {
  const [otp, setOtp] = useState("");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-xs w-full p-6">
        <h2 className="text-xl font-bold mb-3 text-center text-gray-900 dark:text-gray-100">OTP Verification</h2>
        <div className="mb-4">
          <Input
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            className="text-center tracking-widest text-lg font-mono"
            autoFocus
          />
        </div>
        {error && <div className="text-red-500 text-sm mb-2 text-center">{error}</div>}
        <div className="flex justify-between gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button onClick={() => onVerify(otp)} disabled={loading || otp.length !== 6} className="min-w-[90px]">
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;