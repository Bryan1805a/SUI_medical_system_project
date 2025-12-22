import { useState } from "react";
import { useSuiClientQuery, useCurrentAccount } from "@mysten/dapp-kit";
import { LOBBY_ID } from "./config";
import { Users, Copy, CheckCircle, Activity, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

type WaitingPatient = {
  addr: string;
  symptoms: string;
  department: string;
  priority: number | string;
};

export function DoctorLobbyView({ onSelectPatient }: { onSelectPatient: (address: string) => void }) {
  const account = useCurrentAccount();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Query Lobby object để lấy danh sách bệnh nhân
  const { data: lobbyData } = useSuiClientQuery(
    "getObject",
    {
      id: LOBBY_ID || "",
      options: {
        showContent: true,
        showOwner: true,
      },
    },
    {
      enabled: !!LOBBY_ID && LOBBY_ID !== "YOUR_LOBBY_ID_HERE",
      refetchInterval: 5000, // Refresh mỗi 5 giây
    }
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    toast.success("Đã copy địa chỉ!");
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 4) {
      return {
        label: "Khẩn cấp",
        color: "rgba(239,68,68,0.15)",
        borderColor: "#ef4444",
      };
    }
    if (priority === 3) {
      return {
        label: "Ưu tiên",
        color: "rgba(234,179,8,0.1)",
        borderColor: "#eab308",
      };
    }
    return {
      label: "Thường",
      color: "rgba(34,197,94,0.1)",
      borderColor: "#22c55e",
    };
  };

  if (!LOBBY_ID || LOBBY_ID === "YOUR_LOBBY_ID_HERE") {
    return (
      <div className="glass-card fade-in">
        <h3 className="text-highlight" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={20} /> Sảnh chờ bệnh nhân
        </h3>
        <p className="text-muted">
          Chưa cấu hình LOBBY_ID. Vui lòng cập nhật trong config.ts
        </p>
      </div>
    );
  }

  const rawPatients = lobbyData?.data?.content?.fields?.patients || [];
  const patientsArray: WaitingPatient[] = Array.isArray(rawPatients)
    ? rawPatients.map((p: any) => {
        const fields = p?.fields ?? p?.data?.fields ?? p;
        return {
          addr: fields.addr,
          symptoms: fields.symptoms,
          department: fields.department,
          priority: Number(fields.priority),
        };
      })
    : [];

  return (
    <div className="glass-card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 className="text-highlight" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={20} /> Sảnh chờ bệnh nhân
        </h3>
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '0.9em',
          fontWeight: 600,
          color: 'var(--primary-light)',
        }}>
          {patientsArray.length} bệnh nhân
        </div>
      </div>

      {patientsArray.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Users size={48} color="var(--text-muted)" style={{ marginBottom: 16, opacity: 0.5 }} />
          <p className="text-muted">Chưa có bệnh nhân nào đăng ký khám</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {patientsArray.map((patient: WaitingPatient, index: number) => {
            const badge = getPriorityBadge(Number(patient.priority));
            return (
              <div
              key={`${patient.addr}-${index}`}
              className="glass-card"
              style={{
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-color), var(--primary-light))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.1em',
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontWeight: 600 }}>
                      Bệnh nhân #{index + 1}
                    </div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: '0.75em',
                        border: `1px solid ${badge.borderColor}`,
                        background: badge.color,
                      }}
                    >
                      <AlertTriangle size={12} />
                      <span>{badge.label}</span>
                      <span style={{ opacity: 0.7 }}>P{Number(patient.priority)}</span>
                    </div>
                  </div>

                  <div style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.9em',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    {formatAddress(patient.addr)}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(patient.addr);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        color: copiedAddress === patient.addr ? 'var(--primary-color)' : 'var(--text-muted)',
                        transition: 'color 0.2s',
                      }}
                    >
                      {copiedAddress === patient.addr ? (
                        <CheckCircle size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>

                  <div style={{ fontSize: '0.85em', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div>
                      <strong>Chuyên khoa:</strong> {patient.department || "N/A"}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <Activity size={14} style={{ marginTop: 2 }} />
                      <span>
                        <strong>Triệu chứng:</strong> {patient.symptoms || "Chưa cung cấp"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={() => onSelectPatient(patient.addr)}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Chọn bệnh nhân
              </button>
            </div>
          );
          })}
        </div>
      )}

      <div style={{ marginTop: 16, padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', fontSize: '0.85em' }}>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          💡 <strong>Tip:</strong> Danh sách sẽ tự động cập nhật khi có bệnh nhân mới đăng ký
        </p>
      </div>
    </div>
  );
}

