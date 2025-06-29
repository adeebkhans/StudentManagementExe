import React, { useState, useEffect } from "react";

// Generate session options dynamically
const sessionOptions = Array.from({ length: 10 }, (_, i) => {
  // 2024-2026 then 2025-2027 so on..
  const start = 2024 + i;
  const end = start + 2;
  return `${start}-${end}`;
});

const emptyForm = {
  name: "",
  fathername: "",
  mothername: "",
  studentMob: "",
  parentsMob: "",
  aadharcard: "",
  enrollment: "",
  course: "",
  session: "",
};

const StudentForm = ({ onSubmit, initialData, loading }) => {
  const [form, setForm] = useState(emptyForm);

  // Update form state when initialData changes (for editing or creating)
  useEffect(() => {
    setForm(
      initialData && Object.keys(initialData).length > 0
        ? {
            name: initialData.name || "",
            fathername: initialData.fathername || "",
            mothername: initialData.mothername || "",
            studentMob: initialData.studentMob || "",
            parentsMob: initialData.parentsMob || "",
            aadharcard: initialData.aadharcard || "",
            enrollment: initialData.enrollment || "",
            course: initialData.course || "",
            session: initialData.session || "",
          }
        : emptyForm
    );
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate phone numbers and Aadhaar
    if (!/^\d{10}$/.test(form.studentMob)) {
      alert("Student Mobile must be exactly 10 digits.");
      return;
    }
    if (!/^\d{10}$/.test(form.parentsMob)) {
      alert("Parents Mobile must be exactly 10 digits.");
      return;
    }
    if (!/^\d{12}$/.test(form.aadharcard)) {
      alert("Aadhar Card Number must be exactly 12 digits.");
      return;
    }
    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            name="fathername"
            placeholder="Father Name"
            value={form.fathername}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            name="mothername"
            placeholder="Mother Name"
            value={form.mothername}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            name="studentMob"
            placeholder="Student Mobile"
            value={form.studentMob}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
            pattern="\d{10}"
            maxLength={10}
            minLength={10}
            title="Enter a 10-digit mobile number"
          />
        </div>
        <div className="space-y-4">
          <input
            name="parentsMob"
            placeholder="Parents Mobile"
            value={form.parentsMob}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
            pattern="\d{10}"
            maxLength={10}
            minLength={10}
            title="Enter a 10-digit mobile number"
          />
          <input
            name="aadharcard"
            placeholder="Aadhar Card Number"
            value={form.aadharcard}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
            pattern="\d{12}"
            maxLength={12}
            minLength={12}
            title="Enter a 12-digit Aadhaar number"
          />
          <input
            name="enrollment"
            placeholder="Enrollment (optional)"
            value={form.enrollment}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            name="course"
            placeholder="Course (optional)"
            value={form.course}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {/* Session Dropdown */}
          <select
            name="session"
            value={form.session}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Select Session</option>
            {sessionOptions.map((session) => (
              <option key={session} value={session}>
                {session}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;