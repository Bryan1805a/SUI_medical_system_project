import { useState, useEffect } from "react";
import { ConnectButton, useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { CreateProfile } from "./CreateProfile";
import { PatientProfile } from "./PatientProfile";
import { DoctorDashboard } from "./DoctorDashboard";
import { PrescriptionList } from "./PrescriptionList";
import { StatisticsDashboard } from "./StatisticsDashboard";
import { TransactionHistory } from "./TransactionHistory";
import { FindContractIds } from "./FindContractIds";
import { PACKAGE_ID, MODULE_NAME } from "./config";
import { Toaster } from 'react-hot-toast';
import { LayoutDashboard, User, Stethoscope, Activity, Shield } from "lucide-react";
import { AdminDashboard } from "./AdminDashboard";
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

  // Query 3: Check Admin
  const { data: adminData } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      filter: { StructType: `${PACKAGE_ID}::${MODULE_NAME}::AdminCap` },
    },
    { enabled: !!account }
  );

  const patientRecord = patientData?.data?.[0];
  const doctorCap = doctorData?.data?.[0];
  const adminCap = adminData?.data?.[0];

  // Tự động chuyển sang tab Bác sĩ nếu phát hiện có DoctorCap (nhưng không override Admin)
  useEffect(() => {
    if (doctorCap && !adminCap) setActiveTab("doctor");
  }, [doctorCap, adminCap]);

  return (
    <div className="container" style={{ paddingTop: 30, paddingBottom: 100 }}>
      {/* 1. CẤU HÌNH TOASTER (Thông báo bay ra ở góc trên phải) */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#fff',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)'
          },
        }}
      />

      {/* HEADER - Navigation bar */}
      <nav className="glass-card" style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 40,
        padding: "20px 28px"
      }}>
        <h1 className="text-highlight" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12, 
          fontSize: '1.75rem', 
          margin: 0,
          fontWeight: 700
        }}>
          <Activity color="#3b82f6" size={32} /> 
          <span>SUI Medical</span>
        </h1>
        <ConnectButton />
      </nav>

      <div>
        {!account ? (
          <div className="glass-card fade-in" style={{ 
            textAlign: "center", 
            padding: "60px 40px",
            maxWidth: 600,
            margin: "0 auto"
          }}>
            <h2 style={{ marginBottom: 16 }}>👋 Chào mừng đến với hệ thống Y tế Web3</h2>
            <p className="text-muted" style={{ fontSize: '1.1em', marginBottom: 0 }}>
              Vui lòng kết nối ví Sui để tiếp tục
            </p>
          </div>
        ) : PACKAGE_ID === "YOUR_PACKAGE_ID_HERE" ? (
          <div className="fade-in">
            <div className="glass-card" style={{ maxWidth: 800, margin: '0 auto', marginBottom: 30 }}>
              <h2 style={{ marginBottom: 16, color: '#f59e0b' }}>⚠️ Cần cấu hình Contract IDs</h2>
              <p className="text-muted" style={{ marginBottom: 20 }}>
                Bạn đã publish contract thành công! Bây giờ cần cập nhật PACKAGE_ID và LOBBY_ID trong config.ts
              </p>
              <FindContractIds />
            </div>
          </div>
        ) : (
          <div className="fade-in">
            {/* 2. MENU TAB CHUYỂN ĐỔI - Tab navigation */}
            <div style={{ 
              display: 'flex', 
              gap: 12, 
              marginBottom: 30,
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={() => setActiveTab('patient')}
                className={`tab-button ${activeTab === 'patient' ? 'active' : ''}`}
              >
                <User size={18} /> Cổng Bệnh Nhân
              </button>

              {/* Chỉ hiện tab Bác sĩ nếu có quyền */}
              {doctorCap && (
                 <button 
                   onClick={() => setActiveTab('doctor')}
                   className={`tab-button ${activeTab === 'doctor' ? 'active' : ''}`}
                 >
                   <Stethoscope size={18} /> Cổng Bác Sĩ
                 </button>
              )}

              {/* Chỉ hiện tab Admin nếu có AdminCap */}
              {adminCap && (
                 <button 
                   onClick={() => setActiveTab('admin')}
                   className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
                 >
                   <Shield size={18} /> Cổng Admin
                 </button>
              )}
            </div>

            {/* 3. NỘI DUNG CHÍNH (Thay đổi theo Tab) */}
            <div className="glass-card" style={{ minHeight: 500, padding: 40 }}>
              
              {/* === TAB BỆNH NHÂN === */}
              {activeTab === 'patient' && (
                <div className="fade-in">
                  {patientRecord ? (
                    <>
                      <StatisticsDashboard />
                      <div style={{ 
                        margin: "40px 0", 
                        height: 1, 
                        background: 'linear-gradient(90deg, transparent, var(--glass-border) 50%, transparent)',
                        border: 'none'
                      }}></div>
                      <PatientProfile />
                      <div style={{ 
                        margin: "40px 0", 
                        height: 1, 
                        background: 'linear-gradient(90deg, transparent, var(--glass-border) 50%, transparent)',
                        border: 'none'
                      }}></div>
                      <PrescriptionList />
                      <div style={{ 
                        margin: "40px 0", 
                        height: 1, 
                        background: 'linear-gradient(90deg, transparent, var(--glass-border) 50%, transparent)',
                        border: 'none'
                      }}></div>
                      <TransactionHistory />
                    </>
                  ) : (
                    <CreateProfile onCreated={() => setTimeout(refetchPatient, 1000)} />
                  )}
                </div>
              )}

              {/* === TAB BÁC SĨ === */}
              {activeTab === 'doctor' && doctorCap && (
                <div className="fade-in">
                  <DoctorDashboard doctorCapId={doctorCap.data?.objectId!} />
                </div>
              )}

              {/* === TAB ADMIN === */}
              {activeTab === 'admin' && adminCap && (
                <div className="fade-in">
                  <AdminDashboard adminCapId={adminCap.data?.objectId!} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;