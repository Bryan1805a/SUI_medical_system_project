import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAME } from "./config";
import toast from 'react-hot-toast';
import { Shield, UserPlus, Users } from "lucide-react";

export function AdminDashboard({ adminCapId }: { adminCapId: string }) {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [recipientAddress, setRecipientAddress] = useState("");
  const [isMinting, setIsMinting] = useState(false);

  const mintDoctorCap = () => {
    if (!account || !recipientAddress) {
      toast.error("Vui lòng nhập địa chỉ ví bác sĩ!");
      return;
    }

    // Validate địa chỉ Sui (bắt đầu bằng 0x và có độ dài hợp lệ)
    if (!recipientAddress.startsWith("0x") || recipientAddress.length < 10) {
      toast.error("Địa chỉ ví không hợp lệ!");
      return;
    }

    if (!PACKAGE_ID || PACKAGE_ID === "YOUR_PACKAGE_ID_HERE") {
      toast.error("Chưa cấu hình PACKAGE_ID. Vui lòng cập nhật trong config.ts");
      return;
    }

    setIsMinting(true);
    const loadingToast = toast.loading("Đang mint DoctorCap...");

    const txb = new Transaction();
    txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::mint_doctor_cap`,
      arguments: [
        txb.object(adminCapId),
        txb.pure.address(recipientAddress),
      ],
    });

    signAndExecuteTransaction(
      { transaction: txb },
      {
        onSuccess: (result) => {
          toast.success("Đã mint DoctorCap thành công!", { id: loadingToast });
          setRecipientAddress("");
          setIsMinting(false);
          
          // Log transaction digest để debug
          console.log("Transaction Digest:", result.digest);
        },
        onError: (err) => {
          toast.error("Lỗi: " + err.message, { id: loadingToast });
          setIsMinting(false);
        },
      }
    );
  };

  return (
    <div className="glass-card fade-in" style={{ maxWidth: 700, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Shield size={28} color="var(--primary-color)" />
        <h2 className="text-highlight" style={{ margin: 0 }}>
          🛡️ Bảng Quản Trị Admin
        </h2>
      </div>
      
      <p className="text-muted" style={{ fontSize: '0.9em', marginBottom: 20 }}>
        Với AdminCap, bạn có thể mint DoctorCap mới cho các bác sĩ khác trong hệ thống.
      </p>

      <div style={{ 
        background: 'rgba(59, 130, 246, 0.1)', 
        padding: '16px', 
        borderRadius: '12px', 
        marginBottom: 24,
        border: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Shield size={16} />
          <strong style={{ fontSize: '0.9em' }}>AdminCap ID:</strong>
        </div>
        <p style={{ 
          fontFamily: 'monospace', 
          fontSize: '0.85em', 
          margin: 0,
          wordBreak: 'break-all',
          color: 'var(--text-muted)'
        }}>
          {adminCapId}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: 8, fontSize: '0.95em' }}>
            <UserPlus size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            Địa chỉ ví bác sĩ (recipient)
          </label>
          <input 
            className="input-glass"
            placeholder="0x..." 
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            style={{ width: '100%' }}
          />
          <p className="text-muted" style={{ fontSize: '0.8em', marginTop: 6, marginBottom: 0 }}>
            Nhập địa chỉ ví Sui của bác sĩ mà bạn muốn cấp DoctorCap
          </p>
        </div>

        <button 
          className="btn-primary"
          onClick={mintDoctorCap}
          disabled={!recipientAddress || isMinting}
          style={{ 
            padding: '14px 24px', 
            fontSize: '1em',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          {isMinting ? (
            <>
              <span className="spinner" style={{ display: 'inline-block', width: 16, height: 16 }}></span>
              Đang mint...
            </>
          ) : (
            <>
              <UserPlus size={18} />
              Mint DoctorCap mới
            </>
          )}
        </button>
      </div>

      <div style={{ 
        marginTop: 30, 
        padding: '16px', 
        background: 'rgba(34, 197, 94, 0.1)', 
        borderRadius: '12px', 
        border: '1px solid rgba(34, 197, 94, 0.3)',
        fontSize: '0.85em'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Users size={18} style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', marginBottom: 6 }}>💡 Lưu ý:</strong>
            <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-muted)' }}>
              <li>Mỗi DoctorCap được mint sẽ được gửi trực tiếp vào ví của bác sĩ</li>
              <li>Bác sĩ có thể dùng DoctorCap để tạo prescription cho bệnh nhân</li>
              <li>Bạn có thể mint nhiều DoctorCap cho nhiều bác sĩ khác nhau</li>
              <li>AdminCap của bạn sẽ được giữ lại để tiếp tục mint thêm sau này</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

