import React, { useState } from "react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { BadgeIndianRupee, Clock } from "lucide-react";

const transactions = [
  { id: 1, type: "Top-Up", amount: 100, date: "2025-07-10" },
  { id: 2, type: "Booking", amount: -59, date: "2025-07-11" },
  { id: 3, type: "Top-Up", amount: 200, date: "2025-07-12" },
];

export default function WalletPage() {
  const [balance, setBalance] = useState(241);
  const [topUpAmount, setTopUpAmount] = useState("");

  const handleTopUp = () => {
    const amount = parseFloat(topUpAmount);
    if (!isNaN(amount) && amount > 0) {
      setBalance(balance + amount);
      setTopUpAmount("");
      alert(`₹${amount} added to wallet.`);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-sky-600 flex items-center gap-2">
        <BadgeIndianRupee className="w-6 h-6" /> Wallet
      </h1>

      {/* Balance Section */}
      <Card className="mb-6">
        {/* <CardContent className="p-4"> */}
          <h2 className="text-xl font-semibold text-sky-600 mb-2">Current Balance</h2>
          <p className="text-black text-2xl font-medium">₹{balance}</p>
        {/* </CardContent> */}
      </Card>

      {/* Top-Up Section */}
      <Card className="mb-6">
        {/* <CardContent className="p-4"> */}
          <h2 className="text-xl font-semibold text-sky-600 mb-2">Top-Up Wallet</h2>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              placeholder="Enter amount"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              className="w-40"
            />
            <Button onClick={handleTopUp} className="bg-sky-600 text-white">
              Add Money
            </Button>
          </div>
        {/* </CardContent> */}
      </Card>

      {/* Transaction History */}
      <Card>
        {/* <CardContent className="p-4"> */}
          <h2 className="text-xl font-semibold text-sky-600 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Transaction History
          </h2>
          {transactions.length > 0 ? (
            <ul className="space-y-3">
              {transactions.map((tx) => (
                <li key={tx.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-black font-medium">{tx.type}</p>
                    <p className="text-sm text-gray-500">{tx.date}</p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      tx.amount > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.amount > 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No transactions found.</p>
          )}
        {/* </CardContent> */}
      </Card>
    </div>
  );
}
