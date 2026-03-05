const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwJSmUtf6FJOwYurjdeDBAb22oNdNSg4iLvx8UN7x8zOwkVHxnKzI-CDHGQf7CfgwZ6/exec";

const stepTitle = document.getElementById("stepTitle");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const toast = document.getElementById("toast");

const steps = Array.from(document.querySelectorAll(".step"));

const schoolEl = document.getElementById("school");
const otherSchoolWrap = document.getElementById("otherSchoolWrap");

let step = 1;

const CHIP_CONFIG = {
  whatLookingFor: [
    "Networking",
    "Startup fikirleri ve ekip bulma",
    "VC / yatırım dünyasını öğrenme",
    "Event duyuruları (talk, workshop, demo day)",
    "Staj / iş fırsatları (startup ekosistemi)",
    "Mentor / feedback",
    "Pitch pratiği",
    "Sadece ortamı takip etmek",
  ],
  sectors: [
    "AI / ML",
    "SaaS / B2B",
    "Consumer / B2C",
    "Fintech",
    "Gaming",
    "HealthTech",
    "EdTech",
    "Climate / Sustainability",
    "Marketplace / E-commerce",
    "Devtools / Deep Tech",
    "Diğer",
  ],
  next3Months: [
    "Etkinliklere katılmak",
    "İnsan tanımak ve network kurmak",
    "Bir fikir üzerinde çalışmak",
    "Ekip bulmak / ekibe girmek",
    "Pitch deck hazırlamak veya pitch pratiği yapmak",
    "VC101 tarzı içeriklerle öğrenmek",
    "Sadece takip etmek",
  ],
};

const selected = {
  whatLookingFor: new Set(),
  sectors: new Set(),
  next3Months: new Set(),
};

function qs(id){ return document.getElementById(id); }

function setToast(msg, type){
  toast.textContent = msg;
  toast.classList.remove("hidden","ok","bad");
  toast.classList.add(type);
}

function clearToast(){
  toast.classList.add("hidden");
  toast.classList.remove("ok","bad");
  toast.textContent = "";
}

function setErr(key, msg){
  const el = document.getElementById("err_" + key);
  if (el) el.textContent = msg || "";
}

function clearErrors(){
  [
    "name","school","otherSchool","department","phone","email",
    "whatLookingFor","currentStage","sectors","interestOrigin","next3Months"
  ].forEach(k => setErr(k, ""));
}

function renderChips(containerId, items, setRef){
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  items.forEach(label => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = label;
    chip.addEventListener("click", () => {
      if (setRef.has(label)) setRef.delete(label);
      else setRef.add(label);
      chip.classList.toggle("on", setRef.has(label));
    });
    container.appendChild(chip);
  });
}

function updateUI(){
  steps.forEach(s => s.classList.add("hidden"));
  document.querySelector(`.step[data-step="${step}"]`).classList.remove("hidden");

  backBtn.disabled = (step === 1);

  if (step === 1) stepTitle.textContent = "Seni tanıyalım";
  if (step === 2) stepTitle.textContent = "Startup & İlgi Alanları";
  if (step === 3) stepTitle.textContent = "Motivasyon";

  const pct = (step / 3) * 100;
  progressFill.style.width = pct + "%";
  progressText.textContent = `${step} / 3`;

  nextBtn.textContent = (step === 3) ? "Gönder" : "Devam";
}

function schoolOtherToggle(){
  const v = schoolEl.value;
  if (v === "Diğer") otherSchoolWrap.classList.remove("hidden");
  else otherSchoolWrap.classList.add("hidden");
}

schoolEl.addEventListener("change", schoolOtherToggle);

function isEmailValid(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateStep1(){
  let ok = true;
  const name = qs("name").value.trim();
  const school = qs("school").value.trim();
  const otherSchool = qs("otherSchool").value.trim();
  const department = qs("department").value.trim();
  const phone = qs("phone").value.trim();
  const email = qs("email").value.trim();

  if (!name) { setErr("name","Burası boş kalamaz."); ok = false; }
  if (!school) { setErr("school","Okul seç."); ok = false; }
  if (school === "Diğer" && !otherSchool) { setErr("otherSchool","Okul adını yaz."); ok = false; }
  if (!department) { setErr("department","Burası boş kalamaz."); ok = false; }
  if (!phone) { setErr("phone","WhatsApp için telefon şart."); ok = false; }
  if (!email) { setErr("email","Burası boş kalamaz."); ok = false; }
  if (email && !isEmailValid(email)) { setErr("email","Geçerli bir e-posta yaz."); ok = false; }

  return ok;
}

function validateStep2(){
  let ok = true;
  if (selected.whatLookingFor.size === 0) { setErr("whatLookingFor","En az 1 seçim yap."); ok = false; }
  const stage = qs("currentStage").value.trim();
  if (!stage) { setErr("currentStage","Bir seçenek seç."); ok = false; }
  if (selected.sectors.size === 0) { setErr("sectors","En az 1 seçim yap."); ok = false; }
  return ok;
}

function validateStep3(){
  let ok = true;
  const interestOrigin = qs("interestOrigin").value.trim();
  if (!interestOrigin) { setErr("interestOrigin","Burası boş kalamaz."); ok = false; }
  if (selected.next3Months.size === 0) { setErr("next3Months","En az 1 seçim yap."); ok = false; }
  return ok;
}

function collectPayload(){
  const school = qs("school").value.trim();
  return {
    name: qs("name").value.trim(),
    school,
    otherSchool: school === "Diğer" ? qs("otherSchool").value.trim() : "",
    department: qs("department").value.trim(),
    phone: qs("phone").value.trim(),
    email: qs("email").value.trim(),
    linkedin: qs("linkedin").value.trim(),
    instagram: qs("instagram").value.trim(),

    whatLookingFor: Array.from(selected.whatLookingFor),
    currentStage: qs("currentStage").value.trim(),
    sectors: Array.from(selected.sectors),

    interestOrigin: qs("interestOrigin").value.trim(),
    next3Months: Array.from(selected.next3Months),
    extra: qs("extra").value.trim(),
  };
}

async function submit(){
  const payload = collectPayload();

  nextBtn.disabled = true;
  backBtn.disabled = true;
  setToast("Gönderiliyor...", "ok");

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setToast("Gönderildi ✅ Sheet’e düşmesi 1-2 sn sürebilir.", "ok");
    nextBtn.textContent = "Gönderildi";
  } catch (e) {
    setToast("Gönderim başarısız. URL/izin/CORS sorun olabilir. Sheet’i kontrol et.", "bad");
    nextBtn.disabled = false;
    backBtn.disabled = false;
  }
}

backBtn.addEventListener("click", () => {
  clearToast();
  clearErrors();
  step = Math.max(1, step - 1);
  updateUI();
});

nextBtn.addEventListener("click", async () => {
  clearToast();
  clearErrors();

  if (step === 1 && !validateStep1()) return;
  if (step === 2 && !validateStep2()) return;

  if (step < 3) {
    step += 1;
    updateUI();
    return;
  }

  if (!validateStep3()) return;
  await submit();
});

function init(){
  renderChips("whatLookingFor", CHIP_CONFIG.whatLookingFor, selected.whatLookingFor);
  renderChips("sectors", CHIP_CONFIG.sectors, selected.sectors);
  renderChips("next3Months", CHIP_CONFIG.next3Months, selected.next3Months);

  schoolOtherToggle();
  updateUI();
}

init();
