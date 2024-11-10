const express = require("express")
const cors = require("cors")
const sequelize = require("sequelize")
const path = require('path');

const db = new sequelize.Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite"
})

const Aluno = db.define(
  'alunos',
  {
    nome: sequelize.DataTypes.STRING
  }
)

const Presenca = db.define(
  'presencas',
  {
    dia: sequelize.DataTypes.DATEONLY
  }
)

Presenca.belongsTo(Aluno)

db.sync().then(async () => {
  await Aluno.findOrCreate({ where: {nome: "Alan Jhon"}, defaults: {nome: "Alan Jhon"} });
  await Aluno.findOrCreate({ where: {nome: "Alisson"}, defaults: {nome: "Alisson"} });
  await Aluno.findOrCreate({ where: {nome: "Ana"}, defaults: {nome: "Ana"} });
  await Aluno.findOrCreate({ where: {nome: "Angelo"}, defaults: {nome: "Angelo"} });
  await Aluno.findOrCreate({ where: {nome: "Cleones"}, defaults: {nome: "Cleones"} });
  await Aluno.findOrCreate({ where: {nome: "Diego"}, defaults: {nome: "Diego"} });
  await Aluno.findOrCreate({ where: {nome: "Emanuel"}, defaults: {nome: "Emanuel"} });
  await Aluno.findOrCreate({ where: {nome: "Gustavo"}, defaults: {nome: "Gustavo"} });
  await Aluno.findOrCreate({ where: {nome: "Jenniffer"}, defaults: {nome: "Jenniffer"} });
  await Aluno.findOrCreate({ where: {nome: "João"}, defaults: {nome: "João"} });
  await Aluno.findOrCreate({ where: {nome: "Larissa"}, defaults: {nome: "Larissa"} });
  await Aluno.findOrCreate({ where: {nome: "Murilo"}, defaults: {nome: "Murilo"} });
  await Aluno.findOrCreate({ where: {nome: "Pedro"}, defaults: {nome: "Pedro"} });
});

const app = express()
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
});

app.get("/presencas_do_dia", async (req, res) => {
  const alunos = await Aluno.findAll()
  const dia = Date.now()

  const result = [];
  for (const aluno of alunos) {
    const presence = await Presenca.findOne({ where: { dia, alunoId: aluno.id } }) != null
    result.push({
      id: aluno.id,
      nome: aluno.nome,
      presente_hoje: presence
    })
  }

  res.send({ alunos: result })
});

app.post("/marcar_presenca", async (req, res) => {
  const alunos_presentes = req.body.presencas

  await db.transaction(async (t) => {
    const dia = Date.now()
    for (const id of alunos_presentes) {
      const params = { dia, alunoId: id }
      await Presenca.findOrCreate({ where: params, defaults: params, transaction: t })
    }
  });

  res.send({})
})

app.listen(3000, () => {
  console.log("Server started on port 3000")
})
