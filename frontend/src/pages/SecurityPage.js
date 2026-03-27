import React, { useEffect, useState } from "react";
import { securityAPI } from "../services/api";

function SeverityBadge({ severity }) {
  const value = (severity || "").toUpperCase();

  let className =
    "inline-flex rounded-full px-3 py-1 text-xs font-semibold ";

  if (value === "HIGH") {
    className += "bg-red-100 text-red-700";
  } else if (value === "MEDIUM") {
    className += "bg-amber-100 text-amber-700";
  } else if (value === "LOW") {
    className += "bg-blue-100 text-blue-700";
  } else {
    className += "bg-slate-100 text-slate-700";
  }

  return <span className={className}>{value || "UNKNOWN"}</span>;
}

function StatusBadge({ status }) {
  const value = (status || "").toUpperCase();

  let className =
    "inline-flex rounded-full px-3 py-1 text-xs font-semibold ";

  if (value === "OPEN") {
    className += "bg-rose-100 text-rose-700";
  } else if (value === "RESOLVED") {
    className += "bg-emerald-100 text-emerald-700";
  } else {
    className += "bg-slate-100 text-slate-700";
  }

  return <span className={className}>{value || "UNKNOWN"}</span>;
}

export default function SecurityPage() {
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadIncidents = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await securityAPI.getIncidents();
      const data = response?.data?.data || [];

      setIncidents(data);
    } catch (err) {
      console.error("Load incidents error:", err);
      setError("Không tải được danh sách sự cố");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Security Center
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Danh sách sự cố
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Theo dõi các sự cố bảo mật được phát hiện từ hệ thống chat.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={loadIncidents}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Làm mới
            </button>

            <button
              onClick={() => (window.location.href = "/chat")}
              className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm"
            >
              Quay lại chat
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Tổng số incident</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">
              {incidents.length}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Incident đang mở</div>
            <div className="mt-2 text-3xl font-bold text-rose-600">
              {incidents.filter((item) => item.status === "OPEN").length}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Mức độ HIGH</div>
            <div className="mt-2 text-3xl font-bold text-red-600">
              {incidents.filter((item) => item.severity === "HIGH").length}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Bảng sự cố bảo mật
            </h2>
          </div>

          {isLoading ? (
            <div className="px-6 py-10 text-center text-slate-500">
              Đang tải dữ liệu...
            </div>
          ) : error ? (
            <div className="px-6 py-10 text-center text-red-600">{error}</div>
          ) : incidents.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-500">
              Chưa có sự cố nào được ghi nhận.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-left text-sm text-slate-500">
                    <th className="px-6 py-4 font-semibold">ID</th>
                    <th className="px-6 py-4 font-semibold">Loại</th>
                    <th className="px-6 py-4 font-semibold">Mức độ</th>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Mô tả</th>
                    <th className="px-6 py-4 font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 font-semibold">Thời gian</th>
                  </tr>
                </thead>

                <tbody>
                  {incidents.map((incident) => (
                    <tr
                      key={incident.id}
                      className="border-t border-slate-100 text-sm text-slate-700"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {incident.id}
                      </td>
                      <td className="px-6 py-4">{incident.type}</td>
                      <td className="px-6 py-4">
                        <SeverityBadge severity={incident.severity} />
                      </td>
                      <td className="px-6 py-4">{incident.user_id}</td>
                      <td className="px-6 py-4">{incident.description}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={incident.status} />
                      </td>
                      <td className="px-6 py-4">
                        {incident.created_at
                          ? new Date(incident.created_at).toLocaleString()
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}