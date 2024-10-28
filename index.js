const express = require("express")
const cors = require("cors")
const sequelize = require("sequelize")

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
    await Aluno.findOrCreate({ where: {nome: "Alan John"}, defaults: {nome: "Alan John"} })
    await Aluno.findOrCreate({ where: {nome: "Alisson Vitor"}, defaults: {nome: "Alisson Vitor"} })
})

const app = express()
app.use(express.json())
app.use(cors())

app.get("/presencas_do_dia", async (req, res) => {
    const alunos = await Aluno.findAll()

    const result = await Promise.all(alunos.map(async (aluno) => {
        const presence = await Presenca.findOne({where: {dia: Date.now(), alunoId: aluno.id}}) != null
        return {
            "id": aluno.id,
            "nome": aluno.nome,
            "presente_hoje": presence
        }
    }))

    res.send({
        "alunos": result
    })
})

app.post("/marcar_presenca", async (req, res) => {
    const alunos_presentes = req.body.presencas

    await Promise.all(alunos_presentes.map(async (id) => {
        const params = { dia: Date.now(), alunoId: id }
        await Presenca.findOrCreate({where: params, defaults: params})
    }))

    res.send({})
})

app.listen(3000, () => {
    console.log("Server started on port 3000")
})
