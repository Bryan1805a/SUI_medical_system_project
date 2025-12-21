import { useState, useEffect } from "react";
import { ConnectButton, useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { CreateProfile } from "./CreateProfile";
import { PatientProfile } from "./PatientProfile";
import { DoctorDashboard } from "./DoctorDashboard";
import { PrescriptionList } from "./PrescriptionList";
import { PACKAGE_ID, MODULE_NAME } from "./config";
import { Toaster } from 'react-hot-toast'; // <--- MỚI: Thư viện thông báo
import { LayoutDashboard, User, Stethoscope, Activity } from "lucide-react"; // <--- MỚI: Icon
import "./index.css"

function App() {
  const account = useCurrentAccount();
  const [activeTab, setActiveTab] = useState("patient"); // Tab mặc định

  // Query 1: Check Bệnh nhân
  const { data: patientData, refetch: refetchPatient } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      filter: { StructType: `${PACKAGE_ID}::${MODULE_NAME}::MedicalRecord` },
    },
    { enabled: !!account }
  );

  // Query 2: Check Bác sĩ
  const { data: doctorData } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      filter: { StructType: `${PACKAGE_ID}::${MODULE_NAME}::DoctorCap` },
    },
    { enabled: !!account }
  );

  const patientRecord = patientData?.data?.[0];
  const doctorCap = doctorData?.data?.[0];

  // Tự động chuyển sang tab Bác sĩ nếu phát hiện có DoctorCap
  useEffect(() => {
    if (doctorCap) setActiveTab("doctor");
  }, [doctorCap]);

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto", paddingBottom: 100 }}>
      {/* 1. CẤU HÌNH TOASTER (Thông báo bay ra ở góc trên phải) */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          },
        }}
      />

      {/* HEADER */}
      <nav 
        className="glass-card" // Thêm class này để nó mờ mờ ảo ảo
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: 40,
          borderRadius: 12, // Bo tròn nhẹ
          background: 'rgba(0, 0, 0, 0.4)' // Đậm hơn nền thường một chút để nổi bật
        }}
      >
        <h1 className="text-highlight" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5em', margin: 0 }}>
          <Activity color="#3b82f6" size={28} /> SUI Medical
        </h1>
        <ConnectButton />
      </nav>

      <div style={{ marginTop: 20 }}>
        {!account ? (
          <div className="glass-card" style={{ textAlign: "center", padding: 50 }}>
            <h2>👋 Chào mừng đến với hệ thống Y tế Web3</h2>
            <p className="text-muted">Vui lòng kết nối ví để tiếp tục</p>
          </div>
        ) : (
          <div>
            {/* 2. MENU TAB CHUYỂN ĐỔI */}
            <div style={{ display: 'flex', gap: 15, marginBottom: 25 }}>
              <button 
                onClick={() => setActiveTab('patient')}
                className={activeTab === 'patient' ? 'btn-primary' : 'glass-card'}
                style={{ padding: '10px 25px', cursor: 'pointer', border: activeTab === 'patient' ? 'none' : '1px solid rgba(255,255,255,0.1)' }}
              >
                <User size={18} /> Cổng Bệnh Nhân
              </button>

              {/* Chỉ hiện tab Bác sĩ nếu có quyền */}
              {doctorCap && (
                 <button 
                   onClick={() => setActiveTab('doctor')}
                   className={activeTab === 'doctor' ? 'btn-primary' : 'glass-card'}
                   style={{ padding: '10px 25px', cursor: 'pointer', border: activeTab === 'doctor' ? 'none' : '1px solid rgba(255,255,255,0.1)' }}
                 >
                   <Stethoscope size={18} /> Cổng Bác Sĩ
                 </button>
              )}
            </div>

            {/* 3. NỘI DUNG CHÍNH (Thay đổi theo Tab) */}
            <div className="glass-card" style={{ minHeight: 500, padding: 30 }}>
              
              {/* === TAB BỆNH NHÂN === */}
              {activeTab === 'patient' && (
                <div style={{ animation: 'fadeIn 0.5s' }}>
                  {patientRecord ? (
                    <>
                      <PatientProfile />
                      <div style={{ margin: "30px 0", height: 1, background: 'rgba(255,255,255,0.1)' }}></div>
                      <PrescriptionList /> 
                    </>
                  ) : (
                    <CreateProfile onCreated={() => setTimeout(refetchPatient, 1000)} />
                  )}
                </div>
              )}

              {/* === TAB BÁC SĨ === */}
              {activeTab === 'doctor' && doctorCap && (
                <div style={{ animation: 'fadeIn 0.5s' }}>
                  <DoctorDashboard doctorCapId={doctorCap.data?.objectId!} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* CSS Animation nhỏ cho mượt */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default App;