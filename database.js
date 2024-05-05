const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());

const port = 8001;
const uri = 'mongodb://localhost:27017';
const dbName = 'inventario';
const collectionName = 'funcionario';

// Conectar ao MongoDB
let client;

async function connectToDB() {
    try {
        client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log('Conectado ao MongoDB na porta:', port);

        // Buscar todas as informações da coleção após conectar
        const db = client.db(dbName);
        const funcionarios = await db.collection(collectionName).find().toArray();
        console.log('Todos os funcionários:', funcionarios);
    } catch (err) {
        console.error('Erro ao conectar ao MongoDB:', err);
    }
}

connectToDB();

// Inserir um novo funcionário
app.post('/funcionario', async (req, res) => {
    try {
        const db = client.db(dbName);
        const result = await db.collection(collectionName).insertOne(req.body);
        res.status(201).json(result.ops[0]);
    } catch (err) {
        console.error('Erro ao inserir funcionário:', err);
        res.status(500).send('Erro ao inserir funcionário');
    }
});

// Excluir um funcionário
app.delete('/funcionario/:id', async (req, res) => {
    try {
        const db = client.db(dbName);
        const result = await db.collection(collectionName).deleteOne({ _id: ObjectId(req.params.id) });
        if (result.deletedCount === 1) {
            res.status(204).send();
        } else {
            res.status(404).send('Funcionário não encontrado');
        }
    } catch (err) {
        console.error('Erro ao excluir funcionário:', err);
        res.status(500).send('Erro ao excluir funcionário');
    }
});

// Listar todos os funcionários
app.get('/funcionario', async (req, res) => {
    try {
        const db = client.db(dbName);
        const funcionarios = await db.collection(collectionName).find();
        res.json(funcionarios);
    } catch (err) {
        console.error('Erro ao listar funcionários:', err);
        res.status(500).send('Erro ao listar funcionários');
    }
});

// Consultar o inventário completo de um determinado funcionário
app.get('/funcionario/:id', async (req, res) => {
    try {
        const db = client.db(dbName);
        const funcionario = await db.collection(collectionName).findOne({ _id: ObjectId(req.params.id) });
        if (funcionario) {
            res.json(funcionario);
        } else {
            res.status(404).send('Funcionário não encontrado');
        }
    } catch (err) {
        console.error('Erro ao consultar funcionário:', err);
        res.status(500).send('Erro ao consultar funcionário');
    }
});

// Atualizar o nome do funcionário tendo como referência do documento o próprio CPF
app.put('/funcionario/:cpf', async (req, res) => {
    try {
        const db = client.db(dbName);
        const result = await db.collection(collectionName).updateOne({ CPF: req.params.cpf }, { $set: { Nome: req.body.Nome } });
        if (result.modifiedCount === 1) {
            res.status(200).send('Nome do funcionário atualizado');
        } else {
            res.status(404).send('Funcionário não encontrado');
        }
    } catch (err) {
        console.error('Erro ao atualizar nome do funcionário:', err);
        res.status(500).send('Erro ao atualizar nome do funcionário');
    }
});


// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor iniciado na porta ${port}`);
});
