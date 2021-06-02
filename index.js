const express = require('express');
const app = express();

// トップ画面を表示するルーティングを作成してください
app.get('/top', (req, res) => {
  res.render('top.ejs');
});

app.listen(3000);