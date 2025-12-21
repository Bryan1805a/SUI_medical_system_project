import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAME } from "./config";
import { uploadToPinata } from "./pinata"; // <--- Import hàm vừa viết
import toast from 'react-hot-toast';

export function DoctorDashboard({ doctorCapId }: { doctorCapId: string }) {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [patientId, setPatientId] = useState("");
  const [medName, setMedName] = useState("");
  
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
    if (!account || !patientId || !medName || !ipfsHash) {
      toast.error("Vui lòng nhập đủ thông tin và upload đơn thuốc!");
      return;
    }

    const txb = new Transaction();
    const nameBytes = new TextEncoder().encode(medName);
    const ipfsBytes = new TextEncoder().encode(ipfsHash); // Hash thật được mã hóa

    txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::create_prescription`,
      arguments: [
        txb.object(doctorCapId),
        txb.pure.address(patientId),
        txb.pure.vector("u8", nameBytes),
        txb.pure.vector("u8", ipfsBytes),
      ],
    });

    const loadingToast = toast.loading("Đang tạo đơn thuốc..."); // Hiện loading

    signAndExecuteTransaction(
      { transaction: txb },
      {
        onSuccess: () => {
          toast.success("Đã gửi đơn thuốc thành công!", { id: loadingToast }); // Success
          setMedName("");
          setIpfsHash(""); 
        },
        onError: (err) => toast.error("Lỗi: " + err.message, { id: loadingToast }), // Error
      }
    );
  };

  // Logic code giữ nguyên

  return (
    <div className="glass-card" style={{ maxWidth: 500, margin: '0 auto' }}>
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
          <label className="text-muted" style={{ display: 'block', marginBottom: 5 }}>Chẩn đoán / Tên thuốc</label>
          <input 
            className="input-glass"
            placeholder="VD: Thuốc trị cảm cúm..." 
            value={medName}
            onChange={(e) => setMedName(e.target.value)}
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
  );
}