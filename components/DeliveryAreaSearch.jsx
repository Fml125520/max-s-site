"use client";

import { useEffect, useMemo, useState } from "react";

export default function DeliveryAreaSearch() {
  const [branches, setBranches] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/areas")
      .then((res) => res.json())
      .then((data) => setBranches(data.branches || []))
      .finally(() => setLoading(false));
  }, []);

  const allAreas = useMemo(
    () =>
      branches.flatMap((b) =>
        b.areas.map((a) => ({ ...a, branchName: b.name }))
      ),
    [branches]
  );

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return allAreas.filter((a) => a.name.includes(q)).slice(0, 8);
  }, [allAreas, query]);

  return (
    <div dir="rtl" className="mx-auto w-full max-w-md">
      <label className="mb-2 block text-sm font-medium text-[#1A1D23]">
        منطقة التوصيل
      </label>
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="اكتب اسم منطقتك للتوصيل..."
          disabled={loading}
          className="w-full rounded-lg border border-[#E3E6EB] bg-white px-4 py-3 text-sm shadow-sm focus:border-[#1F6F5C] focus:outline-none focus:ring-1 focus:ring-[#1F6F5C]"
        />
      </div>

      {loading && (
        <p className="mt-2 text-xs text-[#667085]">جارِ تحميل المناطق...</p>
      )}

      {!loading && query.trim() && (
        <div className="mt-2 overflow-hidden rounded-lg border border-[#E3E6EB] bg-white shadow-sm">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[#667085]">
              منطقتك مش متاحة عندنا دلوقتي، تقدر تتواصل معانا للتأكيد
            </p>
          ) : (
            <ul className="divide-y divide-[#E3E6EB]">
              {results.map((area) => (
                <li
                  key={area.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-sm text-[#1A1D23]">{area.name}</span>
                  <span className="text-sm font-semibold text-[#1F6F5C]">
                    {area.price} جنيه
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
