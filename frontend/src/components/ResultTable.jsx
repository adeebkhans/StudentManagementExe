import React from "react";

const ResultTable = ({ results, onEdit, onDelete, onView }) => {
  if (!results || results.length === 0) {
    return (
      <div className="bg-white rounded shadow p-8 text-center">
        <p className="text-gray-600">No results found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Session
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject/Practical
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CT1/75
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CT1/5
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CT2/75
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CT2/5
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assignment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Extra Curricular
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Max Marks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Marks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Viva/50
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                File/25
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lab Attendance/25
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result) => {
              // Create rows for all subjects and practicals
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

              return allItems.map((item, itemIndex) => (
                <tr key={`${result._id}-${item.type}-${itemIndex}`} className="hover:bg-gray-50">
                  {/* Student info - only show for first row */}
                  {itemIndex === 0 ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" rowSpan={allItems.length}>
                        <div>
                          <div className="font-medium">{result.student?.name || 'N/A'}</div>
                          <div className="text-gray-500">{result.student?.enrollment || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" rowSpan={allItems.length}>
                        {result.session}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" rowSpan={allItems.length}>
                        {result.year === 'first' ? 'First Year' : 'Second Year'}
                      </td>
                    </>
                  ) : null}

                  {/* Subject/Practical name */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.data?.name || 'N/A'}
                  </td>

                  {/* Subject marks or empty cells for practicals */}
                  {item.type === 'subject' ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {item.data?.marks?.ct1?.outOf75 ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {item.data?.marks?.ct1?.outOf5 ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {item.data?.marks?.ct2?.outOf75 ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {item.data?.marks?.ct2?.outOf5 ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {item.data?.marks?.otherMarks?.assignment ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {item.data?.marks?.otherMarks?.extraCurricular ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {item.data?.marks?.otherMarks?.attendance ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-semibold">
                        25
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-semibold">
                        {item.data?.marks?.totalOutOf25 ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">-</td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-semibold">
                        100
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-semibold">
                        {item.data?.marks?.totalOutOf100 ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {item.data?.marks?.viva ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {item.data?.marks?.file ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {item.data?.marks?.labAttendence ?? '-'}
                      </td>
                    </>
                  )}

                  {/* Actions - only show for first row */}
                  {itemIndex === 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" rowSpan={allItems.length}>
                      <div className="flex space-x-2">
                        {onView && (
                          <button
                            onClick={() => {
                              const id =
                                typeof result.student === "string"
                                  ? result.student
                                  : result.student?._id;
                              if (id) onView(id);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(result)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(result)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultTable;