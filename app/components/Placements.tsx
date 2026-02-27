import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

export default function Placements() {
    const [placement, setPlacement] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const rowsPerPage = 10;

    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    const [rotatedId, setRotatedId] = useState<number | null>(null);

    const handleRowToggle = (member: any,id:number) => {
        setRotatedId((prev) => (prev === id ? null : id));
      }


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
    const fetchPlacementData = async () => {
      try {
        var token = localStorage.getItem("token_partner");
        var userEmail = localStorage.getItem("valid_user_email");
        if(localStorage.getItem("company")){
          var response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}wp-json/custom/v1/placementdata`,
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
            `${process.env.NEXT_PUBLIC_API_URL}wp-json/custom/v1/placementdata`,
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
          setPlacement([]);
        } else {
          const transformed = data.map((member: any) => ({
            job: member.placement,
            employee: member.relay_user_employee,
            status: member.Status,
            startDate: member.Resource_start_date,
            endDate: member.Resource_End_date,
            retail_amt: member.Billing_amount 
    ? parseFloat(String(member.Billing_amount).replace(/,/g, "")) 
    : 0,
          }));

          setPlacement(transformed);
        }
      } catch (error) {
        console.error("Error fetching placement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlacementData();
  }, []);


  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  const filteredplacement = useMemo(() => {
    let sorted = [...placement].filter((m:any) => {
      const matchesSearch = Object.values(m).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesDepartment =
      selectedDepartments.length === 0 || selectedDepartments.includes(m.department);
    return matchesSearch && matchesDepartment;
    });

    if (sortConfig !== null) {
      sorted.sort((a, b) => {
        let aVal:any = a[sortConfig.key];
        let bVal:any = b[sortConfig.key];

        if (sortConfig.key === "startDate" || sortConfig.key === "endDate") { // Fixed: Changed "start_date" to "startDate"
          aVal = parseDateString(aVal);
          bVal = parseDateString(bVal);

          // Handle invalid dates
          if (!aVal && !bVal) return 0;
          if (!aVal) return sortConfig.direction === "asc" ? 1 : -1; // Push invalid dates to the end
          if (!bVal) return sortConfig.direction === "asc" ? -1 : 1;
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return sorted;
  }, [placement, searchTerm, selectedDepartments, sortConfig]);

  const paginatedplacement = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredplacement.slice(start, start + rowsPerPage);
  }, [filteredplacement, currentPage]);


  const totalPages = Math.ceil(filteredplacement.length / rowsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#462EFC] border-t-transparent"></div>
      </div>
    );
  }

    return(
     <div className="overflow-x-auto">

      <div className="w-full overflow-x-auto">
        <table className="min-w-full text-sm sm:text-base">
          <thead className="text-left text-[#848A95] bg-[#F9FAFB]">
            <tr>
              <th className="py-3 px-4  cursor-pointer" onClick={() => handleSort("job")}>
               Job {sortConfig?.key === "job" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className="py-3 px-4  cursor-pointer hidden sm:table-cell" onClick={() => handleSort("employee")}>
                Employee {sortConfig?.key === "employee" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
               <th className="py-3 px-4  cursor-pointer hidden sm:table-cell" onClick={() => handleSort("retail_amt")}>
                Retail Price {sortConfig?.key === "retail_amt" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className="py-3 px-4  cursor-pointer hidden sm:table-cell" onClick={() => handleSort("status")}>
                Status {sortConfig?.key === "status" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className="py-3 px-4  cursor-pointer hidden sm:table-cell" onClick={() => handleSort("startDate")}>
                Start Date {sortConfig?.key === "startDate" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
               <th className="py-3 px-4  cursor-pointer hidden sm:table-cell" onClick={() => handleSort("endDate")}>
                End Date {sortConfig?.key === "endDate" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
            </tr>
          </thead>
          <tbody className="hidden sm:table-row-group">
            {paginatedplacement.map((m:any, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-4 px-4 text-[#848A95]">{m.job}</td>
                <td className="py-4 px-4 text-[#848A95]">{m.employee}</td>
                <td className="py-4 px-4 text-[#848A95]">${m.retail_amt}</td>
                <td className="py-4 px-4 text-[#848A95]">{m.status}</td>
                <td className="py-4 px-4 text-[#848A95]">{m.startDate}</td>
                <td className="py-4 px-4 text-[#848A95]">{m.endDate}</td>
                
              </tr>
            ))}
          </tbody>

          <tbody className="sm:hidden">
            {paginatedplacement.map((m: any, idx) => (
            <tr key={idx} className="border-b">
              <td className="py-4 px-4 text-[#848A95]">
                

                {/* Expandable details */}
                <div className={`w-full ${rotatedId === idx ? "block" : "hidden"}`}>
                  <div className="flex w-full mb-2"><div className="font-semibold flex-1">Name</div><div className="flex-1">{m.job}</div></div>
                  <div className="flex w-full mb-2"><div className="font-semibold flex-1">Employee</div><div className="flex-1">{m.employee}</div></div>
                  <div className="flex w-full mb-2"><div className="font-semibold flex-1">Retail Price</div><div className="flex-1">${m.retail_amt}</div></div>
                  <div className="flex w-full mb-2"><div className="font-semibold flex-1">Status</div><div className="flex-1">{m.status}</div></div>
                  <div className="flex w-full mb-2"><div className="font-semibold flex-1">Start Date</div><div className="flex-1">{m.startDate}</div></div>
                  <div className="flex w-full mb-2"><div className="font-semibold flex-1">End Date</div><div className="flex-1">{m.endDate}</div></div>
                </div>

                 <div className={`font-semibold flex justify-between`}>
                    <div className={` ${rotatedId === idx ? "opacity-0" : "opacity-100"}`}>{m.employee}</div>
                    <button onClick={() => handleRowToggle(m,idx)} className={`ml-2 w-[24px] h-[24px] focus:outline-none transform transition-transform duration-300 ${rotatedId === idx ? "rotate-180" : "rotate-0"}`}>
                  <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="12" fill="#141464" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10l4 4 4-4" />
                </svg>

                  </button>
                  </div>
              </td>
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