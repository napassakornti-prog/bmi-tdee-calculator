// ===================================================================
// ขั้นตอนที่ 1: ดึง element ต่างๆ จากหน้า HTML มาเก็บไว้ในตัวแปร
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
const gaugePin = document.getElementById("gauge-pin");

const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

// ===================================================================
// ขั้นตอนที่ 2: ฟังก์ชันคำนวณ BMI
// สูตร BMI = น้ำหนัก (กก.) หาร ด้วย ส่วนสูง (เมตร) ยกกำลังสอง
// ===================================================================
function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

// ===================================================================
// ขั้นตอนที่ 3: ฟังก์ชันแปลงค่า BMI เป็นหมวดหมู่ (ผอม/ปกติ/เกิน/อ้วน)
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
// ขั้นตอนที่ 5: ฟังก์ชันคำนวณ TDEE = BMR คูณตัวคูณกิจกรรม
// ===================================================================
function calculateTDEE(bmr, activityFactor) {
  return bmr * activityFactor;
}

// ===================================================================
// ขั้นตอนที่ 6: ฟังก์ชันตรวจสอบความถูกต้องของข้อมูล (validation)
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
// ขั้นตอนที่ 8: ฟังก์ชันนับตัวเลขไล่ขึ้นแบบ animate (count-up)
// รับ element, ค่าเป้าหมาย, และจำนวนทศนิยมที่ต้องการ
// ใช้ requestAnimationFrame เพื่อให้ animation ลื่นไหลตามรอบการวาดของเบราว์เซอร์
// ===================================================================
function animateCountUp(element, targetValue, decimals, suffix) {
  const durationMs = 700;
  const startTime = performance.now();
  const startValue = 0;

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / durationMs, 1); // ไม่ให้เกิน 1 (100%)
    const currentValue = startValue + (targetValue - startValue) * progress;

    element.textContent = `${currentValue.toFixed(decimals)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// ===================================================================
// ขั้นตอนที่ 9: ฟังก์ชันขยับหมุด (pin) บนแถบ gauge ไปตามค่า BMI
// แปลงค่า BMI ให้เป็นตำแหน่งเปอร์เซ็นต์ (0-100%) บนแถบ
// ใช้ช่วง BMI 12-40 เป็นขอบเขตของแถบทั้งหมด
// หมายเหตุ: ใช้ element.style ตรงนี้เพราะตำแหน่งเป็นค่าที่คำนวณสดจากข้อมูลผู้ใช้
// ไม่สามารถกำหนดตายตัวไว้ล่วงหน้าใน CSS ได้ ต่างจาก inline style ที่เขียนลงใน HTML ตรงๆ
// ===================================================================
function updateGaugePin(bmi) {
  const minBMI = 12;
  const maxBMI = 40;
  let percent = ((bmi - minBMI) / (maxBMI - minBMI)) * 100;

  // ป้องกันไม่ให้หมุดหลุดออกนอกแถบ ถ้า BMI ต่ำ/สูงเกินขอบเขต
  percent = Math.max(0, Math.min(100, percent));

  gaugePin.style.left = `${percent}%`;
}

// ===================================================================
// ขั้นตอนที่ 10: ฟังก์ชันแสดงผลลัพธ์บนหน้าเว็บ
// ===================================================================
function displayResult(bmi, category, tdee) {
  errorMessage.hidden = true;

  animateCountUp(bmiValueEl, bmi, 1, "");
  animateCountUp(tdeeValueEl, tdee, 0, " กิโลแคลอรี/วัน");

  bmiCategoryEl.textContent = `${category.label}`;
  bmiCategoryEl.className = `result__badge ${category.className}`;

  updateGaugePin(bmi);

  resultSection.hidden = false;
}

// ===================================================================
// ขั้นตอนที่ 11: ฟังก์ชันหลักที่ทำงานเมื่อผู้ใช้กดปุ่ม "คำนวณผลลัพธ์"
// ===================================================================
function handleFormSubmit(event) {
  event.preventDefault();

  const weightKg = parseFloat(weightInput.value);
  const heightCm = parseFloat(heightInput.value);
  const age = parseFloat(ageInput.value);
  const gender = genderSelect.value;
  const activityFactor = parseFloat(activitySelect.value);

  const errorText = validateInputs(weightKg, heightCm, age);
  if (errorText !== "") {
    showError(errorText);
    return;
  }

  const bmi = calculateBMI(weightKg, heightCm);
  const category = getBMICategory(bmi);
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityFactor);

  displayResult(bmi, category, tdee);
}

// ===================================================================
// ขั้นตอนที่ 12: ฟังก์ชันสลับโหมดมืด/สว่าง
// ทำงานโดยสลับ attribute data-theme บนแท็ก <html>
// ค่า CSS variables ทั้งหมดจะเปลี่ยนตาม (ดูใน style.css)
// เก็บค่าที่ผู้ใช้เลือกไว้ใน localStorage เพื่อจำไว้ในครั้งถัดไป
// ===================================================================
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("bmi-app-theme", theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
}

// ===================================================================
// ขั้นตอนที่ 13: ตั้งค่าธีมเริ่มต้นตอนโหลดหน้าเว็บ
// ถ้าผู้ใช้เคยเลือกไว้ใน localStorage ให้ใช้ค่านั้น
// ถ้าไม่เคยเลือก ให้เดาจากการตั้งค่าระบบปฏิบัติการของผู้ใช้ (prefers-color-scheme)
// ===================================================================
function setInitialTheme() {
  const savedTheme = localStorage.getItem("bmi-app-theme");

  if (savedTheme) {
    applyTheme(savedTheme);
    return;
  }

  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(systemPrefersDark ? "dark" : "light");
}

// ===================================================================
// ขั้นตอนที่ 14: ผูก event ทั้งหมด (ใช้ addEventListener เท่านั้น)
// ===================================================================
form.addEventListener("submit", handleFormSubmit);
themeToggleBtn.addEventListener("click", toggleTheme);

setInitialTheme();
