import { useState } from "react";
import { useSuiClientQuery, useCurrentAccount } from "@mysten/dapp-kit";
import { LOBBY_ID } from "./config";
import { Users, Copy, CheckCircle, Activity, AlertTriangle, Stethoscope } from "lucide-react";
import toast from "react-hot-toast";

type WaitingPatient = {
  addr: string;
  symptoms: string;
  department: string;
  priority: number | string;
};

// 👇 Cập nhật kiểu dữ liệu: nhận thêm index (number)
export function DoctorLobbyView({ onSelectPatient }: { onSelectPatient: (address: string, index: number) => void }) {
  const account = useCurrentAccount();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Query Lobby object
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
      refetchInterval: 3000, // Tăng tốc độ refresh lên 3s để thấy thay đổi nhanh hơn
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
          {patientsArray.length} đang chờ
        </div>
      </div>

      {patientsArray.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed var(--glass-border)', borderRadius: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Users size={30} color="var(--text-muted)" style={{ opacity: 0.5 }} />
          </div>
          <p className="text-muted" style={{ margin: 0 }}>Hiện tại không có bệnh nhân nào trong sảnh chờ.</p>
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
                background: 'rgba(255, 255, 255, 0.02)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)';
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flex: 1 }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-color))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.1em',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: '1.05em' }}>
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
                        fontWeight: 600
                      }}
                    >
                      <AlertTriangle size={12} />
                      <span>{badge.label}</span>
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
                      title="Copy địa chỉ"
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

                  <div style={{ fontSize: '0.9em', color: 'var(--text-light)', marginTop: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <span style={{color: 'var(--text-muted)'}}>Khoa: </span> 
                      <strong style={{color: 'var(--primary-light)'}}>{patient.department || "N/A"}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Activity size={14} color="#f472b6" />
                      <span style={{color: 'var(--text-main)'}}>
                        {patient.symptoms || "Chưa cung cấp"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 👇 Nút này giờ sẽ gửi cả INDEX */}
              <button
                className="btn-primary"
                onClick={() => onSelectPatient(patient.addr, index)} 
                style={{ padding: '10px 20px', fontSize: '14px', borderRadius: '10px' }}
              >
                <Stethoscope size={16} />
                Khám ngay
              </button>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}