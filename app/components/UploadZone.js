'use client';

import { formatDateDisplay } from '@/app/lib/dateFormatter';

export default function UploadZone({ onUpload, uploading, message, reportDate, setReportDate }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                {/* Date picker */}
                <div className="flex items-center gap-2 w-full lg:w-auto">
                    <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                        📅 Report Date:
                    </label>
                    <input
                        type="date"
                        value={reportDate}
                        onChange={(e) => setReportDate(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
                        required
                    />
                    {/* {reportDate && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                            {formatDateDisplay(reportDate)}
                        </span>
                    )} */}
                </div>

                {/* File upload with loader */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <label className="relative cursor-pointer">
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={(e) => {
                                if (e.target.files[0]) onUpload(e.target.files[0]);
                                e.target.value = '';
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploading}
                        />
                        <span className={`inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            uploading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-100'
                        }`}>
                            {uploading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-emerald-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Choose File
                                </>
                            )}
                        </span>
                    </label>
                    <span className="text-sm text-gray-400">
                        {uploading ? '⏳' : 'or drag & drop'}
                    </span>
                </div>
            </div>

            {/* Status message with clean styling */}
            {message && (
                <div className={`mt-4 text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 ${
                    message.type === 'error'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                    <span className="text-lg">
                        {message.type === 'error' ? '⚠️' : '✅'}
                    </span>
                    {message.text}
                </div>
            )}
        </div>
    );
}