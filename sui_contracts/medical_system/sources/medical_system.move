module medical::core {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use std::vector;
    use std::string::{String};

    // --- ERROR CODES ---
    const EPatientNotFound: u64 = 1; // Lỗi không tìm thấy bệnh nhân để xóa

    // --- CÁC STRUCT ---

    /// Thẻ bác sĩ (Capability) - Thêm field name để lưu tên bác sĩ cố định
    struct DoctorCap has key, store { 
        id: UID,
        name: String 
    }

    /// Thẻ admin
    struct AdminCap has key, store { id: UID }

    // --- EVENTS ---
    
    struct PrescriptionCreated has copy, drop {
        prescription_id: ID,
        doctor_id: address,
        patient_id: address,
        doctor_name: String, // Thêm tên bác sĩ vào event
        name: String,
        diagnosis: String,
        timestamp: u64,
    }

    struct RecordCreated has copy, drop {
        record_id: ID,
        patient_id: address,
    }

    struct PrescriptionUsed has copy, drop {
        prescription_id: ID,
        patient_id: address,
    }

    struct PatientRegistered has copy, drop {
        patient_id: address,
        lobby_id: ID,
        symptoms: String,
        department: String,
        priority: u8,
    }

    struct DoctorCapMinted has copy, drop {
        doctor_cap_id: ID,
        recipient: address,
        admin: address,
    }

    struct MedicalRecord has key, store {
        id: UID,
        owner: address,
        record_data: String,
    }

    struct WaitingPatient has copy, drop, store {
        addr: address,
        symptoms: String,
        department: String,
        priority: u8,
    }

    struct Prescription has key, store {
        id: UID,
        name: String,
        medication_hash: String,
        doctor_id: address,
        doctor_name: String, // Lưu tên bác sĩ vào đơn thuốc
        diagnosis: String,
        timestamp: u64,
        is_used: bool,
    }

    struct Lobby has key, store {
        id: UID,
        patients: vector<WaitingPatient>,
    }

    // --- KHỞI TẠO ---

    fun init(ctx: &mut TxContext) {
        let deployer = tx_context::sender(ctx);
        transfer::transfer(AdminCap { id: object::new(ctx) }, deployer);
        
        // Tạo Lobby và SHARE
        transfer::share_object(Lobby {
            id: object::new(ctx),
            patients: vector::empty(),
        });
    }

    // --- CÁC HÀM CHỨC NĂNG ---

    /// 1. Tạo hồ sơ
    public fun create_profile(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        let record = MedicalRecord {
            id: object::new(ctx),
            owner: sender,
            record_data: std::string::utf8(b"Ho So Benh Nhan"),
        };
        let record_id = object::id(&record);
        transfer::transfer(record, sender);
        event::emit(RecordCreated { record_id, patient_id: sender });
    }

    /// 2. Đăng ký khám (Join Lobby)
    public fun register_for_examination(
        lobby: &mut Lobby,
        symptoms: vector<u8>,
        department: vector<u8>,
        priority: u8,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let waiting = WaitingPatient {
            addr: sender,
            symptoms: std::string::utf8(symptoms),
            department: std::string::utf8(department),
            priority,
        };
        vector::push_back(&mut lobby.patients, waiting);

        event::emit(PatientRegistered {
            patient_id: sender,
            lobby_id: object::id(lobby),
            symptoms: waiting.symptoms,
            department: waiting.department,
            priority,
        });
    }

    /// 3. Kê đơn & Xóa khỏi Lobby (QUAN TRỌNG NHẤT)
    public fun create_prescription(
        cap: &DoctorCap,           // Cần DoctorCap để lấy tên
        lobby: &mut Lobby,         // Cần Lobby để xóa bệnh nhân
        patient_idx: u64,          // Vị trí bệnh nhân trong hàng chờ (0, 1, 2...)
        name: vector<u8>,
        medication_hash: vector<u8>,
        diagnosis: vector<u8>,
        timestamp: u64,
        ctx: &mut TxContext,
    ) {
        // A. Logic xóa bệnh nhân khỏi hàng chờ
        // Kiểm tra xem index có hợp lệ không
        assert!(patient_idx < vector::length(&lobby.patients), EPatientNotFound);
        
        // Lấy thông tin bệnh nhân ra và xóa khỏi vector
        let patient_data = vector::swap_remove(&mut lobby.patients, patient_idx);
        let patient_addr = patient_data.addr;

        // B. Tạo đơn thuốc
        let prescription_name = std::string::utf8(name);
        let diagnosis_str = std::string::utf8(diagnosis);
        let doctor_name_str = cap.name; // Lấy tên từ thẻ bác sĩ

        let prescription = Prescription {
            id: object::new(ctx),
            name: prescription_name,
            medication_hash: std::string::utf8(medication_hash),
            doctor_id: tx_context::sender(ctx),
            doctor_name: doctor_name_str,
            diagnosis: diagnosis_str,
            timestamp,
            is_used: false,
        };
        let prescription_id = object::id(&prescription);
        
        // Gửi về ví bệnh nhân
        transfer::transfer(prescription, patient_addr);

        event::emit(PrescriptionCreated {
            prescription_id,
            doctor_id: tx_context::sender(ctx),
            patient_id: patient_addr,
            doctor_name: doctor_name_str,
            name: prescription_name,
            diagnosis: diagnosis_str,
            timestamp,
        });
    }

    /// 4. Dùng thuốc
    public fun use_prescription(prescription: &mut Prescription, ctx: &mut TxContext) {
        let prescription_id = object::id(prescription);
        prescription.is_used = true;
        event::emit(PrescriptionUsed {
            prescription_id,
            patient_id: tx_context::sender(ctx),
        });
    }

    /// 5. Admin tạo bác sĩ (Mint DoctorCap)
    public fun mint_doctor_cap(
        _admin: &AdminCap,
        recipient: address,
        name: vector<u8>, // Thêm tên bác sĩ khi mint
        ctx: &mut TxContext,
    ) {
        let admin_addr = tx_context::sender(ctx);
        let new_cap = DoctorCap { 
            id: object::new(ctx),
            name: std::string::utf8(name) 
        };
        let cap_id = object::id(&new_cap);
        
        transfer::transfer(new_cap, recipient);
        
        event::emit(DoctorCapMinted {
            doctor_cap_id: cap_id,
            recipient,
            admin: admin_addr,
        });
    }
}