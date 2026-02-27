import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

export default function ReferralPayment() {
     const [payments, setPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const rowsPerPage = 10;

    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    const toggleExpandRow = (idx: number) => {
        setExpandedRows((prev) =>
            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
        );
    };

    const getTruncatedContent = (content: string) => {
    const words = content.split(" ");
    if (words.length <= 25) return content;
    return words.slice(0, 25).join(" ") + "...";
    };


  const parseDateString = (dateStr:any) => {
    if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      return null;
    }
    const [month, day, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date;
  };

  useEffect(() => {
    const fetchReferralPayments = async () => {
      try {
        var token = localStorage.getItem("token_partner");
        var userEmail = localStorage.getItem("valid_user_email");
        if(localStorage.getItem("company")){
          var response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}wp-json/custom/v1/referralpayments`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                authemail: `Bearer ${userEmail}`,
                company: localStorage.getItem("company")
              },
            }
          );
        }
        else{
          var response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}wp-json/custom/v1/referralpayments`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                authemail: `Bearer ${userEmail}`,
              },
            }
          );
        }

        const data = response.data;

        if (typeof data.error !== "undefined" && data.error !== null) {
          setPayments([]);
        } else {
          const transformed = data.map((member: any) => ({
            date: member.date,
            amount: member.amount,
          }));

          setPayments(transformed);
        }
      } catch (error) {
        console.error("Error fetching referral payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralPayments();
  }, []);


  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  const filteredpayments = useMemo(() => {
    let sorted = [...payments].filter((m:any) => {
      const matchesSearch = Object.values(m).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesDepartment =
      selectedDepartments.length === 0 || selectedDepartments.includes(m.department);
    return matchesSearch && matchesDepartment;
    });

    if (sortConfig !== null) {
       sorted.sort((a, b) => {
        let aVal: any = a[sortConfig.key];
        let bVal: any = b[sortConfig.key];

        // ✅ Sort by date
        if (sortConfig.key === "date") {
        aVal = parseDateString(aVal);
        bVal = parseDateString(bVal);
        if (!aVal && !bVal) return 0;
        if (!aVal) return sortConfig.direction === "asc" ? 1 : -1;
        if (!bVal) return sortConfig.direction === "asc" ? -1 : 1;
        }

        // ✅ Sort by amount
        if (sortConfig.key === "amount") {
        const parseAmount = (amountStr: string): number =>
            parseFloat(amountStr.replace(/[$,]/g, "")) || 0;

        aVal = parseAmount(aVal);
        bVal = parseAmount(bVal);
        }

        // Generic comparison
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });
    }

    return sorted;
  }, [payments, searchTerm, selectedDepartments, sortConfig]);

  const paginatedpayments = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredpayments.slice(start, start + rowsPerPage);
  }, [filteredpayments, currentPage]);


  const totalPages = Math.ceil(filteredpayments.length / rowsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#462EFC] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">

      <div className="w-full overflow-x-auto">
        <table className="min-w-full text-sm sm:text-base">
          <thead className="text-left text-[#848A95] bg-[#F9FAFB]">
            <tr>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort("date")}>
               Payment Date {sortConfig?.key === "date" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
             
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort("amount")}>
                Amount {sortConfig?.key === "amount" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedpayments.map((m:any, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-4 px-4 text-[#848A95]">{m.date}</td>
                <td className="py-4 px-4 text-[#848A95]">{m.amount}</td>      
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 text-sm text-[#848A95]">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="space-x-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 text-[#848A95] disabled:opacity-50 cursor-pointer"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 rounded bg-gray-200 text-[#848A95] disabled:opacity-50 cursor-pointer"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
    );
}