// CSVデータを解析して保存する配列
const surveyResponses = [
    // CSVから読み込んだデータが入ります
];

// 全体または性別ごとの回答傾向を計算する関数
function calculateStats(gender = null) {
    let filteredResponses = surveyResponses;
    if (gender) {
        filteredResponses = surveyResponses.filter(response => response.gender === gender);
    }
    
    const totalResponses = filteredResponses.length;
    if (totalResponses === 0) return Array(10).fill({ yesPercentage: 0, noPercentage: 0 });
    
    const yesCountPerQuestion = Array(10).fill(0);
    
    filteredResponses.forEach(response => {
        response.answers.forEach((answer, index) => {
            if (answer) yesCountPerQuestion[index]++;
        });
    });
    
    return yesCountPerQuestion.map(yesCount => ({
        yesPercentage: Math.round((yesCount / totalResponses) * 100),
        noPercentage: Math.round(((totalResponses - yesCount) / totalResponses) * 100)
    }));
}

// CSVデータを解析して回答を配列に変換
function parseCSVData(csvText) {
    const lines = csvText.split('\n');
    // ヘッダーをスキップ
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(',');
        if (columns.length < 13) continue;
        
        // 性別と回答を抽出
        const gender = columns[1].replace(/"/g, '').trim();
        const answers = columns.slice(3, 13).map(answer => 
            answer.includes('肯定的') || answer.includes('Yes')
        );
        
        surveyResponses.push({
            id: `response_${i}`,
            gender: gender,
            answers: answers
        });
    }
}

// CSVファイルを読み込む
fetch('survey_ver2.csv')
    .then(response => response.text())
    .then(csvText => {
        parseCSVData(csvText);
        window.surveyStats = {
            all: calculateStats(),
            male: calculateStats('男性'),
            female: calculateStats('女性'),
            other: calculateStats('回答したくない')
        };
        // イベントをディスパッチしてデータの読み込み完了を通知
        const event = new Event('dataLoaded');
        document.dispatchEvent(event);
    })
    .catch(error => {
        console.error('Error loading CSV:', error);
    });
