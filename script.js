// ===================================================================
// ขั้นตอนที่ 1: ดึง element ต่างๆ จากหน้า HTML มาเก็บไว้ในตัวแปร
// ทำแบบนี้ครั้งเดียวตอนเริ่มไฟล์ เพื่อไม่ต้องเรียก document.getElementById
// ซ้ำๆ ทุกครั้งที่ต้องใช้งาน element เดิม
// ===================================================================
const form = document.getElementById("bmi-form");
const heightInput = document.getElementById("height");
const weightInput = document.getElementById("weight");
const ageInput = document.getElementById("age");
const genderSelect = document.getElementById("gender");
const activitySelect = document.getElementById("activity");

const errorMessage = document.getElementById("error-message");
const resultSection = document.getElementById("result");
const bmiValueEl = document.getElementById("bmi-value");
const bmiCategoryEl = document.getElementById("bmi-category");
const tdeeValueEl = document.getElementById("tdee-value");

// ===================================================================
// ขั้นตอนที่ 2: ฟังก์ชันคำนวณ BMI
// สูตร BMI = น้ำหนัก (กก.) หาร ด้วย ส่วนสูง (เมตร) ยกกำลังสอง
// รับพารามิเตอร์เป็นตัวเลข คืนค่าเป็นตัวเลข (ยังไม่ปัดทศนิยม)
// ===================================================================
function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100; // แปลงหน่วยจากเซนติเมตรเป็นเมตร
  return weightKg / (heightM * heightM);
}

// ===================================================================
// ขั้นตอนที่ 3: ฟังก์ชันแปลงค่า BMI เป็นหมวดหมู่ (ผอม/ปกติ/เกิน/อ้วน)
// ใช้เกณฑ์มาตรฐานของกระทรวงสาธารณสุข/WHO (แบบเอเชีย)
// คืนค่าเป็น object ที่มีทั้งข้อความและชื่อ class สำหรับใส่สี badge
// ===================================================================
function getBMICategory(bmi) {
  if (bmi < 18.5) {
    return { label: "น้ำหนักน้อยกว่าเกณฑ์", className: "result__badge--under" };
  } else if (bmi < 23) {
    return { label: "น้ำหนักปกติ", className: "result__badge--normal" };
  } else if (bmi < 25) {
    return { label: "น้ำหนักเกิน", className: "result__badge--over" };
  } else {
    return { label: "โรคอ้วน", className: "result__badge--over" };
  }
}

// ===================================================================
// ขั้นตอนที่ 4: ฟังก์ชันคำนวณ BMR ด้วยสูตร Mifflin-St Jeor
// BMR คือพลังงานที่ร่างกายใช้ตอนพัก (ยังไม่รวมกิจกรรม)
// สูตรของชายและหญิงต่างกันที่ค่าคงที่ท้ายสุด (+5 หรือ -161)
// ===================================================================
function calculateBMR(weightKg, heightCm, age, gender) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === "male") {
    return base + 5;
  } else {
    return base - 161;
  }
}

// ===================================================================
// ขั้นตอนที่ 5: ฟังก์ชันคำนวณ TDEE
// TDEE = BMR คูณด้วยตัวคูณกิจกรรม (activityFactor)
// ตัวคูณนี้มาจากค่า value ของ <option> ที่ผู้ใช้เลือกในหน้าเว็บ
// ===================================================================
function calculateTDEE(bmr, activityFactor) {
  return bmr * activityFactor;
}

// ===================================================================
// ขั้นตอนที่ 6: ฟังก์ชันตรวจสอบความถูกต้องของข้อมูล (validation)
// ป้องกันกรณีผู้ใช้ปล่อยว่าง, กรอกตัวหนังสือ, หรือกรอกเลขติดลบ/ผิดช่วง
// คืนค่าเป็นข้อความ error ถ้าพบปัญหา หรือคืนค่า "" (ว่าง) ถ้าข้อมูลถูกต้อง
// ===================================================================
function validateInputs(weightKg, heightCm, age) {
  if (Number.isNaN(weightKg) || Number.isNaN(heightCm) || Number.isNaN(age)) {
    return "กรุณากรอกตัวเลขให้ครบทุกช่อง";
  }
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) {
    return "ค่าที่กรอกต้องมากกว่า 0";
  }
  if (heightCm < 50 || heightCm > 250) {
    return "กรุณากรอกส่วนสูงระหว่าง 50-250 ซม.";
  }
  if (weightKg > 300) {
    return "กรุณากรอกน้ำหนักที่สมเหตุสมผล";
  }
  return "";
}

// ===================================================================
// ขั้นตอนที่ 7: ฟังก์ชันแสดงข้อความ error และซ่อนผลลัพธ์เดิม
// ===================================================================
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
  resultSection.hidden = true;
}

// ===================================================================
// ขั้นตอนที่ 8: ฟังก์ชันแสดงผลลัพธ์บนหน้าเว็บ
// ใช้ template literal (backtick + ${}) ในการประกอบข้อความ
// ตามกติกาของวิชาที่กำหนดให้ใช้ template literal แทนการต่อ string ด้วย +
// ===================================================================
function displayResult(bmi, category, tdee) {
  errorMessage.hidden = true;

  bmiValueEl.textContent = `${bmi.toFixed(1)}`;

  bmiCategoryEl.textContent = `${category.label}`;
  // รีเซ็ต class เดิมก่อน แล้วค่อยใส่ class สีใหม่ตามหมวดหมู่
  bmiCategoryEl.className = `result__badge ${category.className}`;

  tdeeValueEl.textContent = `${Math.round(tdee)} กิโลแคลอรี/วัน`;

  resultSection.hidden = false;
}

// ===================================================================
// ขั้นตอนที่ 9: ฟังก์ชันหลักที่ทำงานเมื่อผู้ใช้กดปุ่ม "คำนวณผลลัพธ์"
// รวบรวมทุกฟังก์ชันด้านบนมาทำงานร่วมกันตามลำดับ
// ===================================================================
function handleFormSubmit(event) {
  event.preventDefault(); // ป้องกันไม่ให้หน้าเว็บ refresh เมื่อ submit ฟอร์ม

  // แปลงค่าจาก input (ที่เป็น string) ให้เป็นตัวเลขด้วย parseFloat
  const weightKg = parseFloat(weightInput.value);
  const heightCm = parseFloat(heightInput.value);
  const age = parseFloat(ageInput.value);
  const gender = genderSelect.value;
  const activityFactor = parseFloat(activitySelect.value);

  // ตรวจสอบข้อมูลก่อนคำนวณเสมอ
  const errorText = validateInputs(weightKg, heightCm, age);
  if (errorText !== "") {
    showError(errorText);
    return; // หยุดการทำงานทันที ไม่คำนวณต่อ
  }

  // คำนวณค่าต่างๆ ตามลำดับ
  const bmi = calculateBMI(weightKg, heightCm);
  const category = getBMICategory(bmi);
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityFactor);

  // แสดงผลลัพธ์บนหน้าเว็บ
  displayResult(bmi, category, tdee);
}

// ===================================================================
// ขั้นตอนที่ 10: ผูก event เข้ากับฟอร์ม
// ใช้ addEventListener เท่านั้น (ห้ามใช้ onclick ใน HTML ตามกติกา)
// เมื่อฟอร์มถูก submit (กดปุ่ม หรือกด Enter) ให้เรียก handleFormSubmit
// ===================================================================
form.addEventListener("submit", handleFormSubmit);
