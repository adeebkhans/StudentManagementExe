import React, { useState } from "react";

// Generate session options dynamically
const sessionOptions = Array.from({ length: 10 }, (_, i) => {
  // 2024-2026 then 2025-2027 so on..
  const start = 2024 + i;
  const end = start + 2;
  return `${start}-${end}`;
});

const searchFields = [
  { value: "name", label: "Name" },
  { value: "fathername", label: "Father Name" },
  { value: "mothername", label: "Mother Name" },
  { value: "studentMob", label: "Student Mobile" },
  { value: "parentsMob", label: "Parent Mobile" },
  { value: "enrollment", label: "Enrollment" },
  { value: "aadharcard", label: "Aadhaar Card" }, 
];

const SearchStudents = ({ onSearch }) => {
  const [field, setField] = useState("name");
  const [query, setQuery] = useState("");
  const [session, setSession] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const searchParams = {};
    if (query && field) searchParams[field] = query;
    if (session) searchParams.session = session;
    onSearch && onSearch(searchParams);
  };

  return (
    <form className="flex flex-wrap gap-2 items-center mb-4" onSubmit={handleSubmit}>
      <select
        className="border px-3 py-2 rounded cursor-pointer"
        value={field}
        onChange={e => setField(e.target.value)}
      >
        {searchFields.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <input
        className="border px-3 py-2 rounded"
        type="text"
        placeholder={`Search by ${searchFields.find(f => f.value === field)?.label || ""}`}
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <select
        className="border px-3 py-2 rounded cursor-pointer" 
        value={session}
        onChange={e => setSession(e.target.value)}
      >
        <option value="">All Sessions</option>
        {sessionOptions.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition cursor-pointer"
      >
        Search
      </button>
    </form>
  );
};

export default SearchStudents;