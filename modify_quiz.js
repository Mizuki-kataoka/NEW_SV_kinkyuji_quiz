const fs = require('fs');
const files = ['SV_1-5.html', 'SV_2-1.html', 'SV_3-1.html', 'SV_4-1.html'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Skip if already modified
  if (content.includes('firebase-config.js')) {
    console.log(`Skipped ${file} - already has firebase-config.js`);
    continue;
  }

  const match = content.match(/quizRanking_(\d-\d)/);
  if (!match) {
    console.log(`Skipped ${file} - no quizKey found.`);
    continue;
  }
  const quizKey = match[0];

  // 1. Change <script> to <script type="module">
  content = content.replace(/<script>/, `<script type="module">\n  import { db, doc, setDoc, onSnapshot } from './firebase-config.js';\n  const quizKey = '${quizKey}';\n  const rankingDocRef = doc(db, 'rankings', quizKey);`);

  // 2. Add state variables
  content = content.replace(/let history\s*=\s*\[\];/, `let history = [];\n  let currentRankings = [];\n  let currentUserName = null;\n  let currentUserScore = null;`);

  // 3. Replace initialization of ranking
  const initRegex = new RegExp(`renderRanking\\(JSON\\.parse\\(localStorage\\.getItem\\('${quizKey}'\\)\\s*\\|\\|\\s*'\\[\\]'\\)\\);`);
  content = content.replace(initRegex, `// Firestoreからリアルタイムでランキングを取得\n  onSnapshot(rankingDocRef, (docSnap) => {\n    if (docSnap.exists()) {\n      currentRankings = docSnap.data().scores || [];\n    } else {\n      currentRankings = [];\n    }\n    renderRanking(currentRankings, currentUserName, currentUserScore);\n  });`);

  // 4. Replace resetBtn listener
  const resetRegex = new RegExp(`resetBtn\\.addEventListener\\('click', \\(\\) => \\{[\\s\\S]*?renderRanking\\(\\[\\]\\);\\s*\\}\\s*\\}\\);`);
  content = content.replace(resetRegex, `resetBtn.addEventListener('click', async () => {\n    if (confirm('ランキングを本当にリセットしますか？')) {\n      await setDoc(rankingDocRef, { scores: [] });\n    }\n  });`);

  // 5. Update finishQuiz
  content = content.replace(/resultEl\.innerHTML = html;\s*updateRanking\\(name,\\s*score\\);/, `resultEl.innerHTML = html;\n    currentUserName = name;\n    currentUserScore = score;\n    updateRanking(name, score);`);

  // 6. Replace updateRanking function
  const updateRankFuncRegex = new RegExp(`//―――― ランキング更新 ――――\\s*function updateRanking\\(name, score\\) \\{[\\s\\S]*?renderRanking\\(data, name, score\\);\\s*\\}`);
  const newUpdateRankFunc = `//―――― ランキング更新 ――――
  async function updateRanking(name, score) {
    const now = new Date().toLocaleString();
    let data = JSON.parse(JSON.stringify(currentRankings));
    const ex = data.find(x=>x.name===name);
    if (ex) { if (score>ex.score) {ex.score = score; ex.date = now;}}
    else    { data.push({name,score, date: now}); }
    data.sort((a,b)=>b.score-a.score);
    await setDoc(rankingDocRef, { scores: data });
  }`;
  content = content.replace(updateRankFuncRegex, newUpdateRankFunc);

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
}
