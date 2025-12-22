import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAME } from "./config";
import { uploadToPinata } from "./pinata";
import { DoctorLobbyView } from "./DoctorLobbyView";
import toast from 'react-hot-toast';

export function DoctorDashboard({ doctorCapId }: { doctorCapId: string }) {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [patientId, setPatientId] = useState("");
  const [prescriptionName, setPrescriptionName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [doctorName, setDoctorName] = useState("");
  
  // State mới cho xử lý file
  const [ipfsHash, setIpfsHash] = useState(""); 
  const [isUploading, setIsUploading] = useState(false); // Để hiện loading xoay xoay

  // Hàm xử lý khi Bác sĩ chọn file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true); // Bật trạng thái loading
    const hash = await uploadToPinata(file); // Gọi hàm upload
    setIsUploading(false); // Tắt loading

    if (hash) {
      setIpfsHash(hash); // Lưu Hash thật vào state
      toast.success("Đã upload ảnh lên IPFS thành công! Hash: " + hash);
    } else {
      toast.error("Upload thất bại. Vui lòng thử lại.");
    }
  };

  const createPrescription = () => {
    if (!account || !patientId || !prescriptionName || !diagnosis || !doctorName || !ipfsHash) {
      toast.error("Vui lòng nhập đầy đủ thông tin (tên đơn, chẩn đoán, tên bác sĩ) và upload đơn thuốc!");
      return;
    }

    if (!PACKAGE_ID || PACKAGE_ID === "YOUR_PACKAGE_ID_HERE") {
      toast.error("Chưa cấu hình PACKAGE_ID. Vui lòng cập nhật trong config.ts");
      return;
    }

    // Validate địa chỉ Sui (bắt đầu bằng 0x và có độ dài hợp lệ)
    if (!patientId.startsWith("0x") || patientId.length < 10) {
      toast.error("Địa chỉ ví bệnh nhân không hợp lệ!");
      return;
    }

    const txb = new Transaction();
    const nameBytes = new TextEncoder().encode(prescriptionName);
    const ipfsBytes = new TextEncoder().encode(ipfsHash);
    const diagnosisBytes = new TextEncoder().encode(diagnosis);
    const doctorNameBytes = new TextEncoder().encode(doctorName);
    const timestampSeconds = Math.floor(Date.now() / 1000);

    txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::create_prescription`,
      arguments: [
        txb.object(doctorCapId),
        txb.pure.address(patientId),
        txb.pure.vector("u8", nameBytes),
        txb.pure.vector("u8", ipfsBytes),
        txb.pure.vector("u8", diagnosisBytes),
        txb.pure.vector("u8", doctorNameBytes),
        txb.pure.u64(timestampSeconds),
      ],
    });

    const loadingToast = toast.loading("Đang tạo đơn thuốc...");

    signAndExecuteTransaction(
      { transaction: txb },
      {
        onSuccess: () => {
          toast.success("Đã gửi đơn thuốc thành công!", { id: loadingToast });
          setPrescriptionName("");
          setDiagnosis("");
          setDoctorName("");
          setPatientId("");
          setIpfsHash(""); 
        },
        onError: (err) => toast.error("Lỗi: " + err.message, { id: loadingToast }),
      }
    );
  };

  // Logic code giữ nguyên

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
      {/* Lobby View */}
      <DoctorLobbyView onSelectPatient={(address) => setPatientId(address)} />

      {/* Prescription Form */}
      <div className="glass-card" style={{ maxWidth: 600, margin: '0 auto', width: '100%' }}>
        <h2 className="text-highlight" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          👨‍⚕️ Bàn làm việc Bác sĩ
        </h2>
        <p className="text-muted" style={{ fontSize: '0.8em', marginBottom: 20 }}>
          ID: {doctorCapId}
        </p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        
        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: 5 }}>Mã ví bệnh nhân</label>
          <input 
            className="input-glass" // Dùng class input mới
            placeholder="0x..." 
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          />
        </div>
        
        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: 5 }}>Tên đơn thuốc</label>
          <input 
            className="input-glass"
            placeholder="VD: Đơn thuốc cảm cúm số 1..." 
            value={prescriptionName}
            onChange={(e) => setPrescriptionName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: 5 }}>Chẩn đoán</label>
          <textarea 
            className="input-glass"
            placeholder="VD: Bệnh nhân sốt 38.5 độ, đau đầu, ho khan..."
            rows={2}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />
        </div>

        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: 5 }}>Tên bác sĩ</label>
          <input 
            className="input-glass"
            placeholder="VD: BS. Nguyễn Văn A"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
          />
        </div>

        {/* Khu vực Upload */}
        <div style={{ padding: 15, background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--glass-border)', borderRadius: 8 }}>
            <label style={{ display: "block", marginBottom: 10, fontWeight: "bold", fontSize: '0.9em' }}>
                📎 Đính kèm X-Quang / Đơn thuốc
            </label>
            <input 
                type="file" 
                onChange={handleFileChange} 
                disabled={isUploading} 
                style={{ color: 'white' }}
            />
            
            {isUploading && <p style={{ color: "#fbbf24", margin: "10px 0 0" }}>⏳ Đang tải lên IPFS...</p>}
            
            {ipfsHash && (
                <p style={{ color: "#4ade80", fontSize: "0.8em", margin: "10px 0 0", wordBreak: "break-all" }}>
                    ✅ Upload xong: {ipfsHash.slice(0, 20)}...
                </p>
            )}
        </div>

        <button 
          className="btn-primary"
          onClick={createPrescription}
          disabled={!ipfsHash || isUploading}
          style={{ marginTop: 10, padding: 15 }}
        >
          ✍️ Ký & Gửi Đơn Thuốc
        </button>
        </div>
      </div>
    </div>
  );
}