import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAME } from "./config";
import QRCode from "react-qr-code"; // <--- MỚI: QR Code
import toast from 'react-hot-toast'; // <--- MỚI: Toast

export function PrescriptionList() {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data, refetch } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      filter: { StructType: `${PACKAGE_ID}::${MODULE_NAME}::Prescription` },
      options: { showContent: true },
    },
    { enabled: !!account }
  );

  const usePrescription = (prescriptionId: string) => {
    setProcessingId(prescriptionId);
    // Toast Loading
    const loadingToast = toast.loading("Đang xác thực trên Blockchain...");

    const txb = new Transaction();
    txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::use_prescription`,
      arguments: [txb.object(prescriptionId)],
    });

    signAndExecuteTransaction(
      { transaction: txb },
      {
        onSuccess: () => {
            toast.success("Mua thuốc thành công!", { id: loadingToast }); // Cập nhật toast cũ
            refetch(); 
            setProcessingId(null);
        },
        onError: (e) => {
            console.error(e);
            toast.error("Lỗi: " + e.message, { id: loadingToast });
            setProcessingId(null);
        },
      }
    );
  };

  if (!data || data.data.length === 0) 
    return <p className="text-muted" style={{ textAlign: "center", marginTop: 20 }}><i>Chưa có đơn thuốc nào.</i></p>;

  return (
    <div style={{ marginTop: 30 }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        💊 Tủ thuốc & Mã QR
      </h3>
      
      <div style={{ display: "grid", gap: 20 }}>
        {data.data.map((item: any) => {
            const fields = item.data?.content?.fields;
            if (!fields) return null;
            const isProcessing = processingId === item.data.objectId;

            // Link IPFS thật
            const ipfsLink = `https://gateway.pinata.cloud/ipfs/${fields.medication_hash}`;

            return (
                <div key={item.data.objectId} className="glass-card" style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                    
                    {/* CỘT 1: QR CODE - ĐIỂM NHẤN */}
                    <div style={{ background: 'white', padding: 10, borderRadius: 12, height: 'fit-content' }}>
                        <QRCode value={ipfsLink} size={80} />
                    </div>

                    {/* CỘT 2: THÔNG TIN */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <h4 style={{ margin: "0 0 5px 0", fontSize: '1.2em' }}>🧾 {fields.name}</h4>
                        <div className="text-muted" style={{ fontSize: '0.9em', marginBottom: 10 }}>
                             ID: {item.data.objectId.slice(0, 10)}...
                        </div>
                        
                        <a href={ipfsLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.9em' }}>
                            👁️ Xem ảnh gốc
                        </a>
                    </div>

                    {/* CỘT 3: NÚT BẤM */}
                    <div>
                        {fields.is_used ? (
                            <div style={{ border: '1px solid #ef4444', color: '#ef4444', padding: "8px 16px", borderRadius: 8, fontWeight: "bold", background: 'rgba(239, 68, 68, 0.1)' }}>
                                🚫 Đã dùng
                            </div>
                        ) : (
                            <button 
                                className="btn-primary"
                                onClick={() => usePrescription(item.data.objectId)}
                                disabled={isProcessing}
                            >
                                {isProcessing ? "⏳ Đang xử lý..." : "✅ Mua ngay"}
                            </button>
                        )}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}