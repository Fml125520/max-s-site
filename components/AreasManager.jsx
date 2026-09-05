"use client";

import { useEffect, useMemo, useState } from "react";

export default function AreasManager() {
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  const [editingBranchName, setEditingBranchName] = useState(false);
  const [branchNameDraft, setBranchNameDraft] = useState("");
  const [savingBranch, setSavingBranch] = useState(false);

  const [edits, setEdits] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [savedId, setSavedId] = useState(null);

  useEffect(() => {
    fetch("/api/areas")
      .then((res) => res.json())
      .then((data) => {
        setBranches(data.branches || []);
        if (data.branches?.length) setSelectedBranchId(data.branches[0].id);
      })
      .catch(() => setNotice({ type: "error", text: "تعذّر تحميل المناطق" }))
      .finally(() => setLoading(false));
  }, []);

  const selectedBranch = branches.find((b) => b.id === selectedBranchId) || null;

  const filteredAreas = useMemo(() => {
    if (!selectedBranch) return [];
    const q = query.trim();
    if (!q) return selectedBranch.areas;
    return selectedBranch.areas.filter((a) => a.name.includes(q));
  }, [selectedBranch, query]);

  function fieldValue(area, field) {
    return edits[area.id]?.[field] ?? area[field];
  }

  function isDirty(area) {
    const e = edits[area.id];
    if (!e) return false;
    const nameChanged = e.name !== undefined && e.name !== area.name;
    const priceChanged =
      e.price !== undefined && String(e.price) !== String(area.price);
    return nameChanged || priceChanged;
  }

  function handleFieldChange(area, field, value) {
    setEdits((prev) => ({
      ...prev,
      [area.id]: { ...prev[area.id], [field]: value },
    }));
  }

  async function handleSaveArea(area) {
    const e = edits[area.id] || {};
    setSavingId(area.id);
    setNotice(null);
    try {
      const res = await fetch("/api/areas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: area.id,
          name: e.name,
          price: e.price !== undefined ? Number(e.price) : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();

      setBranches((prev) =>
        prev.map((b) =>
          b.id !== selectedBranchId
            ? b
            : {
                ...b,
                areas: b.areas.map((a) => (a.id === area.id ? updated : a)),
              }
        )
      );
      setEdits((prev) => {
        const next = { ...prev };
        delete next[area.id];
        return next;
      });
      setSavedId(area.id);
      setTimeout(() => setSavedId((id) => (id === area.id ? null : id)), 1600);
    } catch {
      setNotice({ type: "error", text: "تعذّر حفظ التعديل، حاول تاني" });
    } finally {
      setSavingId(null);
    }
  }

  function startEditBranchName() {
    setBranchNameDraft(selectedBranch?.name || "");
    setEditingBranchName(true);
  }

  async function handleSaveBranchName() {
    if (!selectedBranch || !branchNameDraft.trim()) return;
    setSavingBranch(true);
    setNotice(null);
    try {
      const res = await fetch("/api/branches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedBranch.id, name: branchNameDraft }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setBranches((prev) =>
        prev.map((b) => (b.id === updated.id ? { ...b, name: updated.name } : b))
      );
      setEditingBranchName(false);
    } catch {
      setNotice({ type: "error", text: "تعذّر تعديل اسم الفرع" });
    } finally {
      setSavingBranch(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="mx-auto max-w-3xl p-6 text-[#1A1D23]"
      style={{ fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif" }}
    >
      <header className="mb-6">
        <h1 className="text-xl font-semibold">مناطق التوصيل</h1>
        <p className="mt-1 text-sm text-[#667085]">
          اختر الفرع، وعدّل اسم أي منطقة أو سعرها مباشرة.
        </p>
      </header>

      {notice && (
        <div
          className={`mb-4 rounded-md px-4 py-2.5 text-sm ${
            notice.type === "error"
              ? "bg-red-50 text-red-700"
              : "bg-[#E4F3EF] text-[#17594A]"
          }`}
        >
          {notice.text}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[#667085]">جارِ التحميل...</p>
      ) : (
        <>
          {/* Branch + rename */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <select
              value={selectedBranchId || ""}
              onChange={(e) => {
                setSelectedBranchId(e.target.value);
                setQuery("");
                setEditingBranchName(false);
              }}
              className="rounded-md border border-[#E3E6EB] bg-white px-3 py-2 text-sm font-medium focus:border-[#1F6F5C] focus:outline-none focus:ring-1 focus:ring-[#1F6F5C]"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {!editingBranchName ? (
              <button
                type="button"
                onClick={startEditBranchName}
                className="text-sm text-[#1F6F5C] underline-offset-2 hover:underline"
              >
                تعديل اسم الفرع
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  value={branchNameDraft}
                  onChange={(e) => setBranchNameDraft(e.target.value)}
                  className="rounded-md border border-[#E3E6EB] px-2 py-1.5 text-sm focus:border-[#1F6F5C] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveBranchName}
                  disabled={savingBranch}
                  className="rounded-md bg-[#1F6F5C] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#17594A] disabled:opacity-50"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBranchName(false)}
                  className="text-sm text-[#667085] hover:text-[#1A1D23]"
                >
                  إلغاء
                </button>
              </div>
            )}
          </div>

          {/* Search within branch */}
          <div className="mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن منطقة..."
              className="w-full rounded-md border border-[#E3E6EB] bg-white px-3 py-2.5 text-sm focus:border-[#1F6F5C] focus:outline-none focus:ring-1 focus:ring-[#1F6F5C]"
            />
            <p className="mt-1.5 text-xs text-[#667085]">
              {filteredAreas.length} منطقة
            </p>
          </div>

          {/* Areas list */}
          <div className="divide-y divide-[#E3E6EB] rounded-md border border-[#E3E6EB] bg-white">
            {filteredAreas.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-[#667085]">
                مفيش مناطق مطابقة
              </p>
            ) : (
              filteredAreas.map((area) => (
                <div
                  key={area.id}
                  className="flex flex-wrap items-center gap-2 px-4 py-3"
                >
                  <input
                    value={fieldValue(area, "name")}
                    onChange={(e) =>
                      handleFieldChange(area, "name", e.target.value)
                    }
                    className="min-w-[140px] flex-1 rounded-md border border-transparent px-2 py-1.5 text-sm hover:border-[#E3E6EB] focus:border-[#1F6F5C] focus:outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={fieldValue(area, "price")}
                      onChange={(e) =>
                        handleFieldChange(area, "price", e.target.value)
                      }
                      className="w-20 rounded-md border border-transparent px-2 py-1.5 text-sm hover:border-[#E3E6EB] focus:border-[#1F6F5C] focus:outline-none"
                    />
                    <span className="text-xs text-[#667085]">جنيه</span>
                  </div>
                  {area.zone && (
                    <span className="rounded-full bg-[#F7F8FA] px-2 py-0.5 text-xs text-[#667085]">
                      {area.zone}
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={!isDirty(area) || savingId === area.id}
                    onClick={() => handleSaveArea(area)}
                    className="rounded-md bg-[#1F6F5C] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#17594A] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {savingId === area.id ? "..." : "حفظ"}
                  </button>
                  {savedId === area.id && (
                    <span className="text-xs text-[#1F6F5C]">تم الحفظ</span>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
