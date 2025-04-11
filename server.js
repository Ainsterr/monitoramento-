const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const FILE_PATH = 'messages.json';

app.get('/messages', (req, res) => {
  fs.readFile(FILE_PATH, (err, data) => {
    if (err) return res.status(500).send('Erro ao ler mensagens.');
    res.send(JSON.parse(data));
  });
});

app.post('/messages', (req, res) => {
  const { name, message } = req.body;
  const newMessage = { name, message, timestamp: Date.now() };

  fs.readFile(FILE_PATH, (err, data) => {
    let messages = [];
    if (!err && data.length > 0) messages = JSON.parse(data);

    messages.push(newMessage);

    fs.writeFile(FILE_PATH, JSON.stringify(messages, null, 2), err => {
      if (err) return res.status(500).send('Erro ao salvar mensagem.');
      res.send({ success: true });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});