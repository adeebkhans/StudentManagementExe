import React from "react";

const NewFee = ({ students, onCreateFee }) => (
  <div>
    <table className="min-w-full">
      <thead>
        <tr>
          <th className="px-4 py-2 border">S. No.</th>
          <th className="px-4 py-2 border">Name</th>
          <th className="px-4 py-2 border">Father's Name</th>
          <th className="px-4 py-2 border">Enrollment</th>
          <th className="px-4 py-2 border">Action</th>
        </tr>
      </thead>
      <tbody>
        {students.length === 0 ? (
          <tr>
            <td colSpan={5} className="text-center py-4 text-gray-500">
              No new students found.
            </td>
          </tr>
        ) : (
          students.map((student, idx) => (
            <tr key={student._id}>
              <td className="px-4 py-2 border">{idx + 1}</td>
              <td className="px-4 py-2 border">{student.name}</td>
              <td className="px-4 py-2 border">{student.fathername}</td>
              <td className="px-4 py-2 border">{student.enrollment}</td>
              <td className="px-4 py-2 border">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                  onClick={() => onCreateFee(student)}
                >
                  Create Fee
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default NewFee;