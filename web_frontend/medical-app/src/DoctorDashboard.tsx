import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAME, LOBBY_ID } from "./config";
import { uploadToPinata } from "./pinata";
import { DoctorLobbyView } from "./DoctorLobbyView";
import toast from 'react-hot-toast';

export function DoctorDashboard({ doctorCapId }: { doctorCapId: string }) {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [patientId, setPatientId] = useState("");
  const [patientIndex, setPatientIndex] = useState<number | null>(null);
  const [prescriptionName, setPrescriptionName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [doctorName, setDoctorName] = useState("");
  
  const [ipfsHash, setIpfsHash] = useState(""); 
  const [isUploading, setIsUploading] = useState(false);

  const handleSelectPatient = (address: string, index: number) => {
    setPatientId(address);
    setPatientIndex(index);
    console.log(`Đã chọn bệnh nhân: ${address} tại vị trí: ${index}`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const hash = await uploadToPinata(file);
    setIsUploading(false);

    if (hash) {
      setIpfsHash(hash);
      toast.success("Đã upload ảnh thành công!");
    } else {
      toast.error("Upload thất bại.");
    }
  };

  const createPrescription = () => {
    // 👇 THAY ĐỔI 1: Bỏ check !ipfsHash trong điều kiện validate
    if (!account || !patientId || patientIndex === null || !prescriptionName || !diagnosis || !doctorName) {
      toast.error("Vui lòng nhập đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    if (!PACKAGE_ID || !LOBBY_ID) {
      toast.error("Chưa cấu hình ID trong config.ts");
      return;
    }

    const txb = new Transaction();
    const nameBytes = new TextEncoder().encode(prescriptionName);
    
    // 👇 THAY ĐỔI 2: Nếu không có ảnh, gửi chuỗi rỗng hoặc thông báo mặc định
    const finalHash = ipfsHash || ""; 
    const ipfsBytes = new TextEncoder().encode(finalHash);
    
    const diagnosisBytes = new TextEncoder().encode(diagnosis);
    const doctorNameBytes = new TextEncoder().encode(doctorName);
    const timestampSeconds = Math.floor(Date.now() / 1000);

    txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::create_prescription`,
      arguments: [
        txb.object(doctorCapId),
        txb.object(LOBBY_ID),
        txb.pure.u64(patientIndex),
        txb.pure.vector("u8", nameBytes),
        txb.pure.vector("u8", ipfsBytes), // Vẫn gửi bytes, nhưng là bytes rỗng nếu ko có ảnh
        txb.pure.vector("u8", diagnosisBytes),
        txb.pure.u64(timestampSeconds),
      ],
    });

    const loadingToast = toast.loading("Đang ký đơn thuốc & Xóa khỏi hàng chờ...");

    signAndExecuteTransaction(
      { transaction: txb },
      {
        onSuccess: () => {
          toast.success("Đã gửi đơn thuốc thành công!", { id: loadingToast });
          // Reset form
          setPrescriptionName("");
          setDiagnosis("");
          setDoctorName("");
          setPatientId("");
          setPatientIndex(null);
          setIpfsHash(""); 
        },
        onError: (err) => toast.error("Lỗi: " + err.message, { id: loadingToast }),
      }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
      <DoctorLobbyView 
        onSelectPatient={(address: string, index: number) => handleSelectPatient(address, index)} 
      />

      <div className="glass-card" style={{ maxWidth: 600, margin: '0 auto', width: '100%' }}>
        <h2 className="text-highlight" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          👨‍⚕️ Bàn làm việc Bác sĩ
        </h2>
        <p className="text-muted" style={{ fontSize: '0.8em', marginBottom: 20 }}>
          ID: {doctorCapId}
        </p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        
        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: 5 }}>Mã ví bệnh nhân <span style={{color: 'red'}}>*</span></label>
          <input 
            className="input-glass"
            value={patientId}
            readOnly 
            placeholder="Chọn bệnh nhân từ danh sách trên..."
          />
        </div>
        
        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: 5 }}>Tên đơn thuốc <span style={{color: 'red'}}>*</span></label>
          <input className="input-glass" placeholder="VD: Đơn thuốc cảm cúm..." value={prescriptionName} onChange={(e) => setPrescriptionName(e.target.value)} />
        </div>

        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: 5 }}>Chẩn đoán <span style={{color: 'red'}}>*</span></label>
          <textarea className="input-glass" rows={2} placeholder="Chẩn đoán bệnh..." value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
        </div>

        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: 5 }}>Tên bác sĩ <span style={{color: 'red'}}>*</span></label>
          <input className="input-glass" placeholder="BS. Nguyễn Văn A" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />
        </div>

        <div style={{ padding: 15, background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--glass-border)', borderRadius: 8 }}>
            {/* 👇 THAY ĐỔI 3: Thêm chữ Tùy chọn */}
            <label style={{ display: "block", marginBottom: 10, fontWeight: "bold", fontSize: '0.9em' }}>
                📎 Đính kèm X-Quang / Đơn thuốc (Tùy chọn)
            </label>
            <input type="file" onChange={handleFileChange} disabled={isUploading} style={{ color: 'white' }} />
            {isUploading && <p style={{ color: "#fbbf24", margin: "10px 0 0" }}>⏳ Đang tải lên IPFS...</p>}
            {ipfsHash && <p style={{ color: "#4ade80", fontSize: "0.8em", margin: "10px 0 0" }}>✅ Upload xong: {ipfsHash.slice(0, 20)}...</p>}
        </div>

        <button 
          className="btn-primary"
          onClick={createPrescription}
          // 👇 THAY ĐỔI 4: Bỏ điều kiện !ipfsHash trong disabled
          disabled={isUploading || !patientId || !prescriptionName || !diagnosis}
          style={{ marginTop: 10, padding: 15 }}
        >
          ✍️ Ký & Gửi Đơn Thuốc
        </button>
        </div>
      </div>
    </div>
  );
}