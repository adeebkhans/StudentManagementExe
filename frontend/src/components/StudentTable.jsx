import React from "react";
import { useNavigate } from "react-router-dom";

const StudentTable = ({ students, onUpdate, readOnly }) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2 border">S. No.</th>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Father</th>
            <th className="px-4 py-2 border">Mother</th>
            <th className="px-4 py-2 border">Student Mob</th>
            <th className="px-4 py-2 border">Parents Mob</th>
            <th className="px-4 py-2 border">Enrollment</th>
            <th className="px-4 py-2 border">Session</th>
            <th className="px-4 py-2 border">Aadhaar No.</th>
            <th className="px-4 py-2 border text-center">Aadhaar</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan={11} className="text-center py-4">
                No students found.
              </td>
            </tr>
          ) : (
            students.map((student, idx) => (
              <tr key={student._id}>
                <td className="px-4 py-2 border">{idx + 1}</td>
                <td className="px-4 py-2 border">{student.name}</td>
                <td className="px-4 py-2 border">{student.fathername}</td>
                <td className="px-4 py-2 border">{student.mothername}</td>
                <td className="px-4 py-2 border">{student.studentMob}</td>
                <td className="px-4 py-2 border">{student.parentsMob}</td>
                <td className="px-4 py-2 border">{student.enrollment}</td>
                <td className="px-4 py-2 border">{student.session || "N/A"}</td>
                <td className="px-4 py-2 border text-center">
                  {student.aadharcard || (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-4 py-2 border text-center">
                  {student.aadharImage && student.aadharImage.secure_url ? (
                    <a
                      href={student.aadharImage.secure_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline cursor-pointer"
                    >
                      View Aadhaar
                    </a>
                  ) : (
                    <button
                      className="text-red-600 underline cursor-pointer"
                      onClick={() => navigate(`/aadhaar-upload/${student._id}`)}
                    >
                      Upload Aadhaar
                    </button>
                  )}
                </td>
                <td className="px-4 py-2 border">
                  <div className="flex gap-2 justify-center">
                    {!readOnly && (
                      <button
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition cursor-pointer"
                        onClick={() => onUpdate(student)}
                      >
                        Update
                      </button>
                    )}
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition cursor-pointer"
                      onClick={() => navigate(`/student/${student._id}`)}
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;