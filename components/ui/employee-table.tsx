export default function EmployeeTable({ employees }: any) {
    return (
        <>
            {/* Employees Table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50/80">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Employee Name
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Department
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Phone
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Position
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {employees.map((employee:any) => (
                            <tr
                                key={employee.id}
                                className="transition-colors duration-150 hover:bg-emerald-50/40"
                            >
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">
                                            {employee.name
                                                .split(" ")
                                                .map((part:any) => part[0])
                                                .slice(0, 2)
                                                .join("")
                                                .toUpperCase()}
                                        </div>

                                        <span className="font-semibold text-gray-900">
                                            {employee.name}
                                        </span>
                                    </div>
                                </td>

                                <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                                    {employee.department}
                                </td>

                                <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                                    {employee.phone}
                                </td>

                                <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                                    {employee.position}
                                </td>

                                <td className="whitespace-nowrap px-6 py-4">
                                    <span
                                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${employee.status === "active"
                                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                                                : "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/20"
                                            }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${employee.status === "active"
                                                    ? "bg-emerald-500"
                                                    : "bg-gray-400"
                                                }`}
                                        />
                                        {employee.status}
                                    </span>
                                </td>
                            </tr>
                        ))}

                        {employees.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-6 py-16 text-center"
                                >
                                    <p className="text-sm font-semibold text-gray-700">
                                        No employees found
                                    </p>
                                    <p className="mt-1 text-sm text-gray-400">
                                        Employees will appear here when available.
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Table Footer */}
            <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-gray-700">
                        {employees.length}
                    </span>{" "}
                    employees
                </p>

                <p className="text-xs text-gray-400">
                    AccountFlow Employee Management
                </p>
            </div>
        </>
    )
}