"use client";

import { useState } from "react";
import OpportunityUpdate from "./OpportunityUpdate";
import Library from "./Library";
import Placements from "./Placements";
import ReferralPayment from "./ReferralPayment";

const tabs = ["Opportunity Updates", "Referral Payments","Placements", "Library"];

export default function TeamTabs() {
  const [activeTab, setActiveTab] = useState("Opportunity Updates");

  return (
    <section className="">
      {/* Tabs */}
      <div className="flex space-x-4 mb-6 sm:justify-start overflow-x-auto sm:px-0 px-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`flex items-center gap-2 pb-2 sm:text-sm text-xs sm:text-base border-b-2 transition-colors cursor-pointer whitespace-nowrap min-w-fit shrink-0 ${
              activeTab === tab
                ? "border-[#462EFC] text-[#462EFC] font-semibold"
                : "border-transparent text-[#8984AF] font-semibold"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}wp-content/uploads/2025/08/${tab.toLowerCase().replace(/\s+/g, '-')}${
                activeTab === tab ? "-active" : ""
              }.png`}
              alt={tab}
              className="h-5"
            />
            {tab}
          </button>
        ))}
      </div>

      {/* Persisted Tab Content */}
      <div className={activeTab === "Opportunity Updates" ||  activeTab === "Placements" || activeTab==="Library" ? "block p-2 sm:p-6 lg:p-8 bg-white rounded-xl overflow-auto shadow-md" : "hidden" }>
        <div className={activeTab === "Opportunity Updates" ? "block" : "hidden"}>
          <OpportunityUpdate />
        </div>
       
        <div className={activeTab === "Placements" ? "block" : "hidden"}>
          <Placements />
        </div>
        <div className={activeTab === "Library" ? "block" : "hidden"}>
          <Library />
        </div>
      </div>
      <div className={activeTab === "Referral Payments" ? "block p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md max-w-[900px]" : "hidden" }>
        <div className={activeTab === "Referral Payments" ? "block" : "hidden"}>
          <ReferralPayment />
        </div>
      </div>
    </section>
  );
}
