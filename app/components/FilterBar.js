// app/components/FilterBar.js
'use client';

export default function FilterBar({
    filterType,
    setFilterType,
    filterDate,
    setFilterDate,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    onApplyCustom,
    count,
}) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-wrap items-center gap-3">
            <span className="font-medium text-gray-700">Filter:</span>
            {['all', 'week', 'month', 'custom'].map(type => (
                <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                        filterType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {type === 'all' ? 'All' : type === 'week' ? 'This Week' : type === 'month' ? 'This Month' : 'Custom'}
                </button>
            ))}
            {filterType === 'week' && (
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="border border-gray-300 rounded-full px-3 py-1 text-sm"
                />
            )}
            {filterType === 'month' && (
                <input
                    type="month"
                    value={filterDate.slice(0, 7)}
                    onChange={(e) => setFilterDate(e.target.value + '-01')}
                    className="border border-gray-300 rounded-full px-3 py-1 text-sm"
                />
            )}
            {filterType === 'custom' && (
                <>
                    <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="border border-gray-300 rounded-full px-3 py-1 text-sm"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="border border-gray-300 rounded-full px-3 py-1 text-sm"
                    />
                    <button
                        onClick={onApplyCustom}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700"
                    >
                        Apply
                    </button>
                </>
            )}
            <span className="ml-auto text-sm text-gray-400">{count} rows</span>
        </div>
    );
}