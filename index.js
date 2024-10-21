const express = require('express')
const sequelize = require('sequelize')

const db = new sequelize.Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
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
    await Aluno.findOrCreate({ where: { nome: 'Alan John' }, defaults: { nome: 'Alan John' } })
    await Aluno.findOrCreate({ where: { nome: 'Alisson Vitor' }, defaults: { nome: 'Alisson Vitor' } })
})

async function listarPresencas() {
    const alunos = await Aluno.findAll()

    return await Promise.all(alunos.map(async (aluno) => {
        let presenca = await Presenca.findOne({ where: { alunoId: aluno.id } }) != null

        return {
            "id": aluno.id,
            "nome": aluno.nome,
            "presente_hoje": presenca,
        }
    }))
}

const app = express()
app.use(express.json())

const port = 3000

app.get('/presencas_do_dia', async (req, res) => {
    res.send({ alunos: await listarPresencas() })
})

app.post("/marcar_presenca", async (req, res) => {
    const alunos_presentes = req.body.presencas

    alunos_presentes.forEach((id) => {
        Presenca.create({ dia: Date.now(), alunoId: id })
    })

    res.send({ alunos: await listarPresencas() })
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})