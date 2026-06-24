'use client';

import { formatDateDisplay } from '@/app/lib/dateFormatter';

export default function DateRangePicker({ startDate, setStartDate, endDate, setEndDate, onFetch }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                        📅 From:
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
                    />
                    {/* {startDate && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                            {formatDateDisplay(startDate)}
                        </span>
                    )} */}
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                        To:
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
                    />
                    {/* {endDate && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                            {formatDateDisplay(endDate)}
                        </span>
                    )} */}
                </div>

                <button
    onClick={onFetch}
    className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md inline-flex items-center gap-2"
>
    <img
        src="/search.png"
        alt="Search"
        className="h-5 w-auto rounded-full"
    />
    Show Data
</button>
            </div>
        </div>
    );
}