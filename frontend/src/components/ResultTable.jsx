import React from "react";

const ResultTable = ({ results, onView }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full border text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-3 py-2 border" rowSpan={2}>S.No.</th>
          <th className="px-3 py-2 border" rowSpan={2}>Student Name</th>
          <th className="px-3 py-2 border" rowSpan={2}>Enrollment</th>
          <th className="px-3 py-2 border" rowSpan={2}>Session</th>
          <th className="px-3 py-2 border" rowSpan={2}>Year</th>
          <th className="px-3 py-2 border" colSpan={10}>Subjects & Practicals</th>
          <th className="px-3 py-2 border" rowSpan={2}>Actions</th>
        </tr>
        <tr>
          <th className="px-3 py-2 border">Name</th>
          <th className="px-3 py-2 border">CT1/75</th>
          <th className="px-3 py-2 border">CT1/5</th>
          <th className="px-3 py-2 border">CT2/75</th>
          <th className="px-3 py-2 border">CT2/5</th>
          <th className="px-3 py-2 border">Assignment</th>
          <th className="px-3 py-2 border">Extra Curricular</th>
          <th className="px-3 py-2 border">Attendance</th>
          <th className="px-3 py-2 border">Max Marks</th>
          <th className="px-3 py-2 border">Total Marks</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result, resultIdx) => {
          // Combine subjects and practicals in order: subjects first, then practicals
          const allItems = [
            ...(result.subjects || []).map(subject => ({
              type: 'subject',
              data: subject
            })),
            ...(result.practicals || []).map(practical => ({
              type: 'practical',
              data: practical
            }))
          ];

          const totalRows = allItems.length || 1;

          return allItems.length > 0 ? allItems.map((item, itemIdx) => {
            const isLastRow = itemIdx === totalRows - 1;
            return (
              <tr
                key={result._id + "-" + itemIdx}
                className={isLastRow ? "border-b-2 border-gray-400" : ""}
              >
                {itemIdx === 0 && (
                  <>
                    <td className="border px-3 py-2" rowSpan={totalRows}>{resultIdx + 1}</td>
                    <td className="border px-3 py-2" rowSpan={totalRows}>{result.student?.name}</td>
                    <td className="border px-3 py-2" rowSpan={totalRows}>{result.student?.enrollment}</td>
                    <td className="border px-3 py-2" rowSpan={totalRows}>{result.session}</td>
                    <td className="border px-3 py-2" rowSpan={totalRows}>{result.year}</td>
                  </>
                )}
                
                {/* Name column */}
                <td className="border px-3 py-2">{item.data?.name || ""}</td>
                
                {/* Subject-specific columns or empty for practicals */}
                {item.type === 'subject' ? (
                  <>
                    <td className="border px-3 py-2">{item.data?.marks?.ct1?.outOf75 ?? ""}</td>
                    <td className="border px-3 py-2">{item.data?.marks?.ct1?.outOf5 ?? ""}</td>
                    <td className="border px-3 py-2">{item.data?.marks?.ct2?.outOf75 ?? ""}</td>
                    <td className="border px-3 py-2">{item.data?.marks?.ct2?.outOf5 ?? ""}</td>
                    <td className="border px-3 py-2">{item.data?.marks?.otherMarks?.assignment ?? ""}</td>
                    <td className="border px-3 py-2">{item.data?.marks?.otherMarks?.extraCurricular ?? ""}</td>
                    <td className="border px-3 py-2">{item.data?.marks?.otherMarks?.attendance ?? ""}</td>
                    <td className="border px-3 py-2">25</td>
                    <td className="border px-3 py-2">{item.data?.marks?.totalOutOf25 ?? ""}</td>
                  </>
                ) : (
                  <>
                    <td className="border px-3 py-2"></td>
                    <td className="border px-3 py-2"></td>
                    <td className="border px-3 py-2"></td>
                    <td className="border px-3 py-2"></td>
                    <td className="border px-3 py-2"></td>
                    <td className="border px-3 py-2"></td>
                    <td className="border px-3 py-2"></td>
                    <td className="border px-3 py-2">100</td>
                    <td className="border px-3 py-2">{item.data?.marks ?? ""}</td>
                  </>
                )}

                {/* Actions only on first row */}
                {itemIdx === 0 && (
                  <td className="border px-3 py-2" rowSpan={totalRows}>
                    <button 
                      className="text-blue-600 hover:text-blue-800 font-medium" 
                      onClick={() => onView(result.student?._id || result.student)}
                    >
                      View
                    </button>
                  </td>
                )}
              </tr>
            );
          }) : (
            // Empty result case
            <tr key={result._id}>
              <td className="border px-3 py-2">{resultIdx + 1}</td>
              <td className="border px-3 py-2">{result.student?.name}</td>
              <td className="border px-3 py-2">{result.student?.enrollment}</td>
              <td className="border px-3 py-2">{result.session}</td>
              <td className="border px-3 py-2">{result.year}</td>
              <td className="border px-3 py-2" colSpan={10}>No data</td>
              <td className="border px-3 py-2">
                <button 
                  className="text-blue-600 hover:text-blue-800 font-medium" 
                  onClick={() => onView(result.student?._id || result.student)}
                >
                  View
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default ResultTable;