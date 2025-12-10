// ---------- script.js (full) ----------

// ---------- Starfield background ----------
const starCanvas = document.getElementById("starfield");
const sctx = starCanvas.getContext && starCanvas.getContext("2d");
let starsArr = [];
const STAR_COUNT = 140;

function resizeStars(){
  if(!starCanvas || !sctx) return;
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeStars);
resizeStars();

function makeStars(){
  if(!starCanvas || !sctx) return;
  starsArr = [];
  for(let i=0;i<STAR_COUNT;i++){
    starsArr.push({
      x: Math.random()*starCanvas.width,
      y: Math.random()*starCanvas.height,
      r: Math.random()*1.8,
      s: 0.15 + Math.random()*0.7,
      a: 0.2 + Math.random()*0.8
    });
  }
}

function drawStars(){
  if(!starCanvas || !sctx) return;
  sctx.clearRect(0,0,starCanvas.width, starCanvas.height);
  sctx.fillStyle = "#fff";
  for(const st of starsArr){
    sctx.globalAlpha = st.a;
    sctx.beginPath();
    sctx.arc(st.x, st.y, st.r, 0, Math.PI*2);
    sctx.fill();
    st.y += st.s;
    if(st.y > starCanvas.height){ st.y = -2; st.x = Math.random()*starCanvas.width; }
  }
  sctx.globalAlpha = 1;
  requestAnimationFrame(drawStars);
}

makeStars();
drawStars();


// ---------- my Logic ----------
const form = document.getElementById("userForm");
const fateSection = document.getElementById("fateSection");
const fateCardsEls = document.querySelectorAll(".fate-card");
let results = { Love:null, Career:null, Health:null };

// helper: ensure images exist by mapping chosen.name to image filename
function getImagePath(card){
  return `images/${card.name}.jpg`;
}

// ---------- ✅ Fixed parseBirthdate ----------
function parseBirthdate(raw){
  if(!raw || typeof raw !== "string") return null;
  raw = raw.trim();



  // 1) YYYY-MM-DD
  const isoDash = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  const isoDash2 = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

   // 2) YYYY/MM/DD
   const yyyySlash = /^(\d{4})\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/;
   const yyyySlash2 = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;

   // 3) MM/DD/YYYY
   const mmddSlash = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(\d{4})$/;
   const mmddSlash2 = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;



  


let year, month, day, m;

  if(isoDash.test(raw)){
    m = raw.match(isoDash);
    year = m[1]; month = m[2]; day = m[3];
  } else if(isoDash2.test(raw)){
    m = raw.match(isoDash2);
    year = m[1]; month = m[2]; day = m[3];
  } else if(yyyySlash.test(raw)){
    m = raw.match(yyyySlash);
    year = m[1]; month = m[2]; day = m[3];
  } else if(yyyySlash2.test(raw)){
    m = raw.match(yyyySlash2);
    year = m[1]; month = m[2]; day = m[3];
  } else if(mmddSlash.test(raw)){
    m = raw.match(mmddSlash);
    year = m[3]; month = m[1]; day = m[2];
  } else if(mmddSlash2.test(raw)){
    m = raw.match(mmddSlash2);
    year = m[3]; month = m[1]; day = m[2];
  } else {
    return null;
  }



  const Y = Number(year);
  const M = Number(month);
  const D = Number(day);

  // ✅ realistic year range check
  const currentYear = new Date().getFullYear();
  if (Y < 1900 || Y > currentYear) return null;

  const iso = `${Y}-${String(M).padStart(2,"0")}-${String(D).padStart(2,"0")}`;
  const dt = new Date(iso);

  if(isNaN(dt.getTime())) return null;
  if(dt.getFullYear() !== Y || dt.getMonth()+1 !== M || dt.getDate() !== D) return null;

  return dt;
}


// Luck algorithm
function getLuckScore(birthdateObj, gender, category){
  const baseNum = (birthdateObj.getTime() % 100);
  const genScore = gender === "男性" ? 12 : 7;
  const catBonus = { Love:10, Career:20, Health:5 }[category] || 0;
  const jitter = Math.floor(Math.random()*40) - 8;
  const raw = Math.floor((baseNum + genScore + catBonus + jitter) % 100);
  return Math.max(0, Math.min(100, raw));
}

// get tarot card
function getCardForPath(path){
  if(typeof tarotCards === "undefined") return { name:"TheSun", message:"No cards loaded.", element:"air" };
  const pool = tarotCards.filter(c => c.category === path);
  if(pool.length === 0) return tarotCards[Math.floor(Math.random()*tarotCards.length)];
  return pool[Math.floor(Math.random()*pool.length)];
}

// apply element aura class to body
function applyElementAura(el){
  document.body.classList.remove("fire","water","earth","air");
  if(!el) return;
  const cls = el.toLowerCase();
  if(["fire","water","earth","air"].includes(cls)) document.body.classList.add(cls);
}


// ---------- Form submit ----------
if(form){
  form.addEventListener("submit", (e)=>{
    e.preventDefault();

    const birthRaw = document.getElementById("birthdate").value;
    const gender = document.getElementById("gender").value;
    const birthDate = parseBirthdate(String(birthRaw));

    if(!birthRaw || !gender){
      Swal.fire({ icon:"warning", title:"入力が足りません", text:"誕生日と性別を入力してください。" });
      return;
    }

    if(!birthDate){
      Swal.fire({
        icon: "error",
        title: "誕生日エラー",
        text: "正しい日付を入力してください（1900〜現在の年の間）。"
      });
      return;
    }

    form.classList.add("hidden");
    fateSection.classList.remove("hidden");

    Swal.fire({
      title: "🔮 Start — Pick a Path",
      html: `<p class="swal-text">誕生日と性別に基づいてあなたの運勢を導きます。各カードをクリックして結果を見てください。</p>`,
      confirmButtonText: "OK",
      background: "rgba(12,0,20,0.95)",
      color: "#fff"
    });
  });
}


// ---------- Card click handler ----------
if(fateCardsEls && fateCardsEls.length){
  fateCardsEls.forEach((el) => {
    el.addEventListener("click", async () => {
      try {
        if(el.classList.contains("done")) return;

        const birthRaw = document.getElementById("birthdate").value;
        const gender = document.getElementById("gender").value;

        if(!birthRaw || !gender){
          Swal.fire({ icon:"warning", title:"入力が足りません", text:"誕生日と性別を入力してください。" });
          return;
        }

        const birthDate = parseBirthdate(String(birthRaw));
        if(!birthDate){
          Swal.fire({
            icon: "error",
            title: "誕生日エラー",
            text: "正しい日付を入力してください（例: 2000/11/11 または 2000-11-11、1900〜現在の年）。"
          });
          return;
        }

        const path = el.dataset.path;
        const luck = getLuckScore(birthDate, gender, path);
        const chosen = getCardForPath(path);

        el.classList.add("flipped");
        const back = el.querySelector(".back");
        if(back) back.style.backgroundImage = `url("${getImagePath(chosen)}")`;

        applyElementAura(chosen.element);

        setTimeout(() => {
          Swal.fire({
            title:`${path} — ${chosen.name.replace(/_/g," ")}`,
            html: `
              <div id="popupInner">
                <p style="font-size:16px;margin:6px 0 10px;">${chosen.message}</p>
                <div class="progress-container"><div class="progress-bar" id="luckBar"></div></div>
                <p style="margin-top:8px;">Luck Score: <b>${luck}%</b></p>
              </div>
            `,
            imageUrl: getImagePath(chosen),
            imageWidth: 220,
            imageHeight: 320,
            background: "#120017",
            color: "#fff",
            confirmButtonText: "Next",
            didOpen: () => {
              const bar = Swal.getHtmlContainer().querySelector("#luckBar");
              if(bar){
                bar.style.width = "0%";
                setTimeout(()=> { bar.style.width = luck + "%"; }, 250);
              }
            }
          }).then(() => {
            el.classList.add("done");
            results[path] = luck;
            if(results.Love !== null && results.Career !== null && results.Health !== null){
              showFinalFate();
            }
          });

          setTimeout(()=> el.classList.remove("flipped"), 1200);
        }, 900);
      } catch(err){
        console.error("Card click error:", err);
        Swal.fire({ icon:"error", title:"エラー", text:"予期しないエラーが発生しました。" });
      }
    });
  });
}


// ---------- Final Fate ----------

const lowLuckAdvice = [
  "今日はゆっくり休んで、自分を労わる時間を持ちましょう。",
  "小さな目標を立てて、一歩ずつ進むことが大切です。",
  "他人に頼ることも勇気のひとつです。相談してみましょう。",
  "過去の失敗を振り返り、次に活かしましょう。",
  "心を落ち着けて、深呼吸してみましょう。",
  "今日は新しいことに挑戦するより、準備に専念しましょう。",
  "感謝の気持ちを言葉にしてみると運気が上がります。",
  "自分に優しい言葉をかけてあげましょう。",
  "無理に動かず、体と心の声に耳を傾けましょう。",
  "計画を見直すのに適した日です。",
  "小さな成功を認めることがモチベーションになります。",
  "好きな音楽を聴いてリラックスしましょう。",
  "今日は一歩引いて物事を観察する日です。",
  "自分の感情を紙に書き出して整理しましょう。",
  "軽い運動やストレッチで心身をリフレッシュ。",
  "信頼できる人と話すことで心が軽くなります。",
  "少しの工夫で生活のリズムを整えましょう。",
  "笑顔を意識して過ごすと小さな幸運が訪れます。",
  "焦らず、ペースを守ることが大切です。",
  "今日の気づきをメモして明日につなげましょう。"
];
const mediumLuckAdvice = [
  "今日は安定した流れがあります。",
  "バランス感覚が冴えています。",
  "小さな挑戦にも適したタイミングです。",
  "周囲との協調が大切になります。",
  "あなたのペースでしっかり進める日です。",
  "結果よりプロセスを大事にしましょう。",
  "人間関係が穏やかに進みます。",
  "自信を持って進むと良いでしょう。",
  "努力が形になりやすい日です。",
  "冷静さが良い方向へ導きます。",
  "自然と良い選択ができます。",
  "過去の努力が支えになります。",
  "計画通りに物事が運びやすいです。",
  "優しさが相手にも伝わります。",
  "安定した気持ちが運を高めます。",
  "一歩前進するチャンスです。",
  "物事がちょうど良く整い始めます。",
  "あなたらしさが輝きます。",
  "丁寧な行動が良い未来を呼びます。",
  "安心して進んで大丈夫です。"
];

const goodLuckAdvice = [
  "幸運の波があなたに向かっています。",
  "自信を持って進める最高のタイミングです。",
  "直感が冴えて成功につながります。",
  "行動するほどチャンスが増えます。",
  "強いエネルギーが味方しています。",
  "願いが現実に近づく日です。",
  "魅力が最大限に発揮されます。",
  "大きな前進が期待できます。",
  "思い切った決断が成功します。",
  "あなたの輝きが周囲を動かします。",
  "夢に向かう力が高まっています。",
  "努力の成果が見え始めます。",
  "積極的な行動が最良の結果を生みます。",
  "あなたの才能が花開く瞬間です。",
  "新しいチャンスがやってきます。",
  "運命があなたの味方です。",
  "自分の力を信じるべき日です。",
  "あなたの選択が未来を強く照らします。",
  "幸せの扉が開こうとしています。",
  "思い描いた未来が現実になります。"
];
const toBeGoodLuckAdvice = [
  "今日は静かに過ごすことで運が整い始めます。",
  "焦らずに準備を整えることで未来が開けます。",
  "ゆっくり深呼吸し、気持ちを落ち着かせましょう。",
  "無理をせず、ほんの少し前に踏み出すだけで十分です。",
  "今は種まきの時期です。未来に向けて準備を。",
  "心をリセットすることで良い流れが生まれます。",
  "今日の積み重ねが明日の幸運を呼びます。",
  "静かな時間が運を整えてくれます。",
  "目標を見直すのに最適なタイミングです。",
  "慎重に考えることで良い兆しが見えてきます。",
  "ゆったりと過ごすとエネルギーが回復します。",
  "環境を整えるだけで運が向上します。",
  "あなたの心が整うにつれて運も整います。",
  "焦らず丁寧に動くことで未来が良くなります。",
  "今日は守りの姿勢が吉です。",
  "不要なものを整理すると、運の流れが良くなります。",
  "今は静かに進むことが最善です。",
  "小さな行動が幸運のきっかけになります。",
  "準備を丁寧に行うことで未来が明るくなります。",
  "明日に向けて運の地盤を固める日です。"
];

  const toBeGoodLuckAdviceItems=toBeGoodLuckAdvice[Math.floor(Math.random()*toBeGoodLuckAdvice.length)];
  const lowLuckAdviceItems=lowLuckAdvice[Math.floor(Math.random()*lowLuckAdvice.length)];
  const mediumLuckAdviceItems=mediumLuckAdvice[Math.floor(Math.random()*mediumLuckAdvice.length)];
   const goodLuckAdviceItems=goodLuckAdvice[Math.floor(Math.random()*goodLuckAdvice.length)];
  



function showFinalFate(){
  const sum = results.Love + results.Career + results.Health;
  const total = Math.round(sum / 3);
  const finalGradient = "linear-gradient(90deg,#ff00cc,#00e5ff,#8eff66)";
   

  Swal.fire({

   
    title:` 🌌あなたの運命は`,
    html: `
      <div style="position:relative;">
        <div style="display:flex;gap:12px;justify-content:center;margin-bottom:10px;">
          <div style="min-width:120px"><b>Love</b><div style="color:#ff77aa">${results.Love}%</div></div>
          <div style="min-width:120px"><b>Career</b><div style="color:#66e8ff">${results.Career}%</div></div>
          <div style="min-width:120px"><b>Health</b><div style="color:#88ff99">${results.Health}%</div></div>
        </div>

        <div class="progress-container"><div class="progress-bar" id="finalBar" style="background: ${finalGradient};"></div></div>
        <p style="margin-top:12px; font-size:16px;">✨ Total Fate Energy: <b>${total}%</b></p>
        <p style="opacity:0.95;margin-top:8px;">${
          total > 75 ? goodLuckAdviceItems:
          total > 45 ?mediumLuckAdviceItems: 
         total >= 20 ? lowLuckAdviceItems: toBeGoodLuckAdviceItems
    
        }</p>
      </div>
    `,
    background: "#2b0a3d",
    color: "#fff",
    showConfirmButton: true,
    confirmButtonText: "💫 Accept Your Fate 💫", // ← duplicate မလိုပါ
    didOpen: () => {
      const bar = Swal.getHtmlContainer().querySelector("#finalBar");
      if (bar) {
        setTimeout(() => {
          bar.style.width = total + "%";
        }, 300);
      }
    },
  }).then((result) => {
    // သေချာစစ်ပါ — user က Confirm ကို နှိပ်ထားမှသာ reset လုပ်မယ်
    if (result && result.isConfirmed) {
      // 1) form ကို reset & ပြန်ပြ
      const formEl = document.getElementById("userForm");
      if (formEl) {
        formEl.reset();                // clear inputs
        formEl.classList.remove("hidden"); // show form again
        formEl.style.display = "";    // force visible
      }

      // 2) fate selection / cards ကို ဖျောက်
      const cardContainer = document.getElementById("cardContainer");
      if (cardContainer) {
        cardContainer.classList.add("hidden");
        cardContainer.style.display = "none";
      }
      const fateSec = document.getElementById("fateSection");
      if (fateSec) {
        fateSec.classList.add("hidden");
        fateSec.style.display = "none";
      }

      // 3) clear any per-run state so next run fresh
      results = { Love:null, Career:null, Health:null };
      // (optional) clear card flipped/done classes if exist
      document.querySelectorAll(".tarot-card").forEach(c => {
        c.classList.remove("flipped","done");
        const back = c.querySelector(".back");
        if (back) back.style.backgroundImage = "";
      });

      // 4) scroll to top
      window.scrollTo({ top:0, behavior:"smooth" });
    }
  });
}





