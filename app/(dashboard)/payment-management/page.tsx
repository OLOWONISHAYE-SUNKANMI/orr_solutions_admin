"use client";
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  MoreVertical,
  Wallet,
} from "lucide-react";
import { useState } from "react";

const tableData = [
  {
    refId: "456789366",
    transactionDate: "Sept 12, 2024, 4:30PM",
    date: "2024-07-26",
    status: "Pending",
    amount: "+5,670",
    type: "Income",
    from: "fadel@gmail.com",
  },
  {
    refId: "456789366",
    transactionDate: "Sept 12, 2024, 4:30PM",
    date: "2024-07-26",
    status: "Completed",
    amount: "+5,670",
    type: "Savings",
    from: "Wise - 5466xxx",
  },
  {
    refId: "456789366",
    transactionDate: "Sept 12, 2024, 4:30PM",
    date: "2024-07-26",
    status: "Cancelled",
    amount: "-15,670",
    type: "Expenses",
    from: "Paypal - 5466xxx",
  },
  {
    refId: "456789366",
    transactionDate: "Sept 12, 2024, 4:30PM",
    date: "2024-07-26",
    status: "Pending",
    amount: "+3,670",
    type: "Income",
    from: "fadel@gmail.com",
  },
  {
    refId: "456789366",
    transactionDate: "Sept 12, 2024, 4:30PM",
    date: "2024-07-26",
    status: "Completed",
    amount: "+35,670",
    type: "Savings",
    from: "Wise - 5466xxx",
  },
];
const navCategories = ["All", "Savings", "Income", "Expenses"];
function page() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-8">
            <h1 className="text-4xl font-bold text-white">
              Transactions History
            </h1>
            <div className="flex items-center justify-between gap-3">
              <div className="text-white bg-primary p-3 rounded-xl">
                Sep 9, 2024 - Oct 15, 2024
              </div>
              <div className="flex items-center gap-3">
                <button className="text-white bg-primary p-3 rounded-xl">
                  Export CSV
                </button>
                <button className="text-white bg-primary p-3 rounded-xl">
                  Download Invoices
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="bg-white/10 rounded-lg p-4 w-full">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 w-10 h-10 rounded-full">
                    <DollarSign className="w-6 h-6 text-primary m-2" />
                  </div>
                  <div>
                    <p>Balances</p>
                    <p className="font-bold text-3xl">$78,987.00</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 w-full">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 w-10 h-10 rounded-full">
                    <Wallet className="w-6 h-6 text-primary m-2" />
                  </div>
                  <div>
                    <p>Savings</p>
                    <p className="font-bold text-3xl">$23,000.00</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 w-full">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 w-10 h-10 rounded-full">
                    <ArrowDown className="w-6 h-6 text-primary m-2" />
                  </div>
                  <div>
                    <p>Incomes</p>
                    <p className="font-bold text-3xl">$28,670.00</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 w-full">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 w-10 h-10 rounded-full">
                    <ArrowUp className="w-6 h-6 text-primary m-2" />
                  </div>
                  <div>
                    <p>Expenses</p>
                    <p className="font-bold text-3xl">$3,456.00</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg">
              <div  className="flex items-center justify-between px-3">
                <div className="flex items-center">
                  {navCategories.map((category, index) => (
                    <div
                      onClick={() => setSelectedCategory(category)}
                      key={index}
                      className={`px-4 py-3 text-lg cursor-pointer ${
                        selectedCategory === category
                          ? "text-primary border-b-2 border-primary font-bold"
                          : ""
                      }`}
                    >
                      {category}
                    </div>
                  ))}
                </div>

                <div className=" text-lg">Status: All</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary">
                    <tr>
                      <th className="text-left p-3">Ref ID</th>
                      <th className="text-left p-3">Transaction Date</th>
                      <th className="text-left p-3">From</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-4">
                    {tableData.map((row, index) => (
                      <tr key={index} className="border-b border-[#0ec277]">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-white ">{row.refId}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-white ">
                              {row.transactionDate}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 flex items-center gap-3">
                          <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center">
                            {row.from[0].toUpperCase()}
                          </div>
                          <span>{row.from}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-white/70">{row.type}</span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="rounded text-sm ">{row.amount}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`rounded text-sm ${
                              row.status === "Completed"
                                ? "bg-green-500/20 text-green-500 p-2"
                                : row.status === "Pending"
                                ? "bg-yellow-500/20 text-yellow-500 p-2"
                                : "bg-red-500/20 text-red-500 p-2"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-end">
                            <MoreVertical />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
