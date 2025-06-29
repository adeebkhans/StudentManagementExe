import React from "react";

const FeeTable = ({ fees, onAction }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white rounded shadow">
      <thead>
        <tr>
          <th className="px-4 py-2 border">S. No.</th>
          <th className="px-4 py-2 border">Student Name</th>
          <th className="px-4 py-2 border">Father's Name</th>
          <th className="px-4 py-2 border">Enrollment</th>
          <th className="px-4 py-2 border">Fee Code</th>
          <th className="px-4 py-2 border">Session</th>
          <th className="px-4 py-2 border">Total Fee</th>
          <th className="px-4 py-2 border">Deposited</th>
          <th className="px-4 py-2 border">Remaining</th>
          {onAction && <th className="px-4 py-2 border">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {fees.length === 0 ? (
          <tr>
            <td colSpan={onAction ? 10 : 9} className="text-center py-4">
              No fee records found.
            </td>
          </tr>
        ) : (
          fees.map((fee, idx) => (
            <tr key={fee._id}>
              <td className="px-4 py-2 border">{idx + 1}</td>
              <td className="px-4 py-2 border">{fee.student?.name || "N/A"}</td>
              <td className="px-4 py-2 border">{fee.student?.fathername || "N/A"}</td>
              <td className="px-4 py-2 border">{fee.student?.enrollment || "N/A"}</td>
              <td className="px-4 py-2 border">{fee.code || "N/A"}</td>
              <td className="px-4 py-2 border">{fee.session || "N/A"}</td>
              <td className="px-4 py-2 border">{fee.fee ?? "N/A"}</td>
              <td className="px-4 py-2 border">{fee.deposited ?? "N/A"}</td>
              <td className="px-4 py-2 border">
                {typeof fee.fee === "number" && typeof fee.deposited === "number"
                  ? fee.fee - fee.deposited
                  : "N/A"}
              </td>
              {onAction && (
                <td className="px-4 py-2 border">
                  <div className="flex gap-2 justify-center">
                    {onAction(fee)}
                  </div>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default FeeTable;