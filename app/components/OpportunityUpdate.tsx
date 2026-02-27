import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";

export default function OpportunityUpdate() {

    const [updates, setUpdates] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const rowsPerPage = 10;
    const [rotatedId, setRotatedId] = useState<number | null>(null);

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

    const handleRowToggle = (member: any,id:number) => {
        setRotatedId((prev) => (prev === id ? null : id));
      }


  const parseDateString = (dateStr:any) => {
    if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      return null;
    }
    const [month, day, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date;
  };

  useEffect(() => {
    const fetchOpportunityUpdates = async () => {
      try {
        var token = localStorage.getItem("token_partner");
        var userEmail = localStorage.getItem("valid_user_email");
        if(localStorage.getItem("company")){
          var response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}wp-json/custom/v1/opportunitydata`,
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
            `${process.env.NEXT_PUBLIC_API_URL}wp-json/custom/v1/opportunitydata`,
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
          setUpdates([]);
        } else {
          const transformed = data.map((member: any) => ({
            companyName: member.company_name,
            opportunity: member.opportunity,
            salesPartner: member.sales_partner,
            touchpointDate: member.touchpoint_date,
            description: member.description,
            touchpointType: member.touchpoint_type,
            touchpointTitle: member.touchpoint_title,
          }));

          setUpdates(transformed);
        }
      } catch (error) {
        console.error("Error fetching opportunity updates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunityUpdates();
  }, []);


  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  const filteredupdates = useMemo(() => {
    let sorted = [...updates].filter((m:any) => {
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

        if (sortConfig.key === "touchpointDate") { // Fixed: Changed "start_date" to "startDate"
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
  }, [updates, searchTerm, selectedDepartments, sortConfig]);

  const paginatedupdates = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredupdates.slice(start, start + rowsPerPage);
  }, [filteredupdates, currentPage]);


  const totalPages = Math.ceil(filteredupdates.length / rowsPerPage);

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
          <thead className="text-left text-[#848A95]  bg-[#F9FAFB]">
            <tr>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort("companyName")}>
               Company {sortConfig?.key === "companyName" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className="py-3 px-4  cursor-pointer hidden sm:table-cell" onClick={() => handleSort("opportunity")}>
                Opportunity Name {sortConfig?.key === "opportunity" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className="py-3 px-4  cursor-pointer hidden sm:table-cell" onClick={() => handleSort("salesPartner")}>
                Sales Rep {sortConfig?.key === "salesPartner" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className="py-3 px-4  cursor-pointer hidden sm:table-cell" onClick={() => handleSort("touchpointDate")}>
                Date {sortConfig?.key === "touchpointDate" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
               <th className="py-3 px-4  cursor-pointer hidden sm:table-cell" onClick={() => handleSort("touchpointType")}>
                Touch Type {sortConfig?.key === "touchpointType" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className="py-3 px-4  cursor-pointer hidden sm:table-cell" onClick={() => handleSort("touchpointTitle")}>
                Title {sortConfig?.key === "touchpointTitle" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className="py-3 px-4  cursor-pointer hidden sm:table-cell" onClick={() => handleSort("description")}>
                Content {sortConfig?.key === "description" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
            </tr>
          </thead>
          <tbody className="hidden sm:table-row-group">
            {paginatedupdates.map((m:any, idx) => (
              <tr key={idx} className="border-b" >
                <td className="py-4 px-4 text-[#848A95]">{m.companyName}</td>
                <td className="py-4 px-4 text-[#848A95]">{m.opportunity}</td>
                <td className="py-4 px-4 text-[#848A95]">{m.salesPartner}</td>
                <td className="py-4 px-4 text-[#848A95]">{m.touchpointDate}</td>
                <td className="py-4 px-4 text-[#848A95]">{m.touchpointType}</td>
                <td className="py-4 px-4 text-[#848A95]">{m.touchpointTitle}</td>
                <td className="py-4 px-4 text-[#848A95] max-w-xs overflow-hidden whitespace-normal break-words">
                {expandedRows.includes(idx)
                    ? m.description
                    : getTruncatedContent(m.description)}
                {m.description.split(" ").length > 25 && (
                    <button
                    onClick={() => toggleExpandRow(idx)}
                    className="ml-2 text-blue-500 hover:underline focus:outline-none"
                    >
                    {expandedRows.includes(idx) ? "Read less" : "Read more"}
                    </button>
                )}
                </td>
                
              </tr>
            ))}
          </tbody>
          <tbody className="sm:hidden">
                 {paginatedupdates.map((m:any, idx) => (
              <tr key={idx} className="border-b" >
                <td className="py-4 px-4 text-[#848A95] "> 
                <div className={`w-full ${rotatedId === idx ? "block" : "hidden"}`}>
                  <div className="flex w-full mb-2"><div className="font-semibold flex-1">Name</div><div className="flex-1">{m.companyName}</div></div>
                  <div className="flex w-full mb-2"><div className="font-semibold flex-1">Opportunity</div><div className="flex-1">{m.opportunity}</div></div>
                  <div className="flex w-full mb-2"><div className="font-semibold flex-1">Sales Rep</div><div className="flex-1">{m.salesPartner}</div></div>
                  <div className="flex w-full mb-2"><div className="font-semibold flex-1">Date</div><div className="flex-1">{m.touchpointDate}</div></div>
                  <div className="flex w-full mb-2"><div className="font-semibold flex-1">Touch Type</div><div className="flex-1">{m.touchpointType}</div></div>
                  <div className="flex w-full mb-2"><div className="font-semibold flex-1">Title</div><div className="flex-1">{m.touchpointTitle}</div></div>
                  <div className="flex w-full mb-2"><div className="font-semibold flex-1">Content</div>
                  <div className="flex-1 max-w-xs overflow-hidden whitespace-normal break-words">{expandedRows.includes(idx)
                    ? m.description
                    : getTruncatedContent(m.description)}
                {m.description.split(" ").length > 25 && (
                    <button
                    onClick={() => toggleExpandRow(idx)}
                    className="ml-2 text-blue-500 hover:underline focus:outline-none"
                    >
                    {expandedRows.includes(idx) ? "Read less" : "Read more"}
                    </button>
                )}</div></div>
                  </div>
                  <div className={`font-semibold flex justify-between`}>
                    <div className={` ${rotatedId === idx ? "opacity-0" : "opacity-100"}`}>{m.companyName}</div>
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