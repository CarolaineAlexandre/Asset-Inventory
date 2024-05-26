const express = require('express');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

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
        console.log('Conectado ao MongoDB');
    } catch (err) {
        console.error('Erro ao conectar ao MongoDB:', err);
    }
}

connectToDB();

// Consultar todos os funcionários
app.get('/funcionarios', async (req, res) => {
    try {
        const db = client.db(dbName);
        const result = await db.collection(collectionName).find().toArray();
        res.status(200).json(result);
    } catch (err) {
        console.error('Erro ao consultar funcionários:', err);
        res.status(500).send('Erro ao consultar funcionários');
    }
});

// Criar novo funcionário
app.post('/funcionario', async (req, res) => {
    try {
        const db = client.db(dbName);
        const result = await db.collection(collectionName).insertOne(req.body);

        if (result.acknowledged) {
            const novoFuncionario = {
                _id: result.insertedId,
                ...req.body
            };
            console.log('Novo funcionário inserido');
            res.status(201).json(novoFuncionario);
        } else {
            throw new Error('Nenhum documento inserido.');
        }
    } catch (err) {
        console.error('Erro ao criar novo funcionário:', err);
        res.status(500).send('Erro ao criar novo funcionário.');
    }
});

// Excluir um funcionário
app.delete('/funcionario/:id', async (req, res) => {
    const funcionarioId = req.params.id;

    try {
        const db = client.db(dbName);
        const funcionario = await db.collection(collectionName).findOne({ _id: new ObjectId(funcionarioId) });

        if (!funcionario) {
            res.status(404).send(`Funcionário com ID ${funcionarioId} não encontrado.`);
            return;
        }

        // Um funcionário só pode ser excluído se não houver nenhum ativo configurado para ele
        const ativosConfigurados = [
            funcionario.Monitor1.Presente,
            funcionario.Monitor2.Presente,
            funcionario.Teclado.Presente,
            funcionario.Mouse.Presente,
            funcionario.Desktop.Presente,
            funcionario.Nobreak.Presente,
            funcionario.Headset.Presente,
            funcionario.Celular.Presente,
            funcionario.Acessórios.Presente
        ].some(presente => presente === "SIM");

        if (ativosConfigurados) {
            res.status(400).send(`Funcionário com ID ${funcionarioId} não pode ser deletado pois possui ativos configurados.`);
            return;
        }

        const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(funcionarioId) });

        if (result.deletedCount === 1) {
            console.log(`Funcionário com ID ${funcionarioId} deletado.`);
            res.status(200).send(`Funcionário com ID ${funcionarioId} deletado.`);
        } else {
            console.log(`Funcionário com ID ${funcionarioId} não encontrado.`);
            res.status(404).send(`Funcionário com ID ${funcionarioId} não encontrado.`);
        }
    } catch (err) {
        console.error('Erro ao deletar o funcionário:', err);
        res.status(500).send('Erro ao deletar o funcionário.');
    }
});


// Atualizar o nome do funcionário tendo como referência do documento o próprio CPF
app.put('/funcionario/nome', async (req, res) => {
    const { CPF, newName } = req.body;

    if (!CPF || !newName) {
        res.status(400).send('CPF e novoNome são obrigatórios.');
        return;
    }

    try {
        const db = client.db(dbName);
        const result = await db.collection(collectionName).updateOne(
            { CPF: CPF },
            { $set: { Name: newName } }
        );

        if (result.matchedCount === 0) {
            res.status(404).send(`Funcionário com CPF ${CPF} não encontrado.`);
            return;
        }

        if (result.modifiedCount === 1) {
            console.log(`Nome do funcionário com CPF ${CPF} atualizado para ${newName}.`);
            res.status(200).send(`Nome do funcionário com CPF ${CPF} atualizado para ${newName}.`);
        } else {
            res.status(304).send('Nenhuma alteração feita no nome do funcionário.');
        }
    } catch (err) {
        console.error('Erro ao atualizar o nome do funcionário:', err);
        res.status(500).send('Erro ao atualizar o nome do funcionário.');
    }
});


// Atualizar a informação de um ativo
// app.put('/funcionario/:cpf/ativo/:ativo', async (req, res) => {
//     const { cpf, ativo } = req.params;
//     const novoAtivo = req.body;

//     try {
//         const db = client.db(dbName);
//         const update = {};

//         update[ativo] = novoAtivo;

//         const result = await db.collection(collectionName).updateOne(
//             { CPF: cpf },
//             { $set: update }
//         );

//         if (result.matchedCount === 0) {
//             res.status(404).send(`Funcionário com CPF ${cpf} não encontrado.`);
//             return;
//         }

//         if (result.modifiedCount === 1) {
//             res.status(200).send(`Ativo ${ativo} do funcionário com CPF ${cpf} atualizado.`);
//         } else {
//             res.status(304).send('Nenhuma alteração feita no ativo do funcionário.');
//         }
//     } catch (err) {
//         console.error('Erro ao atualizar o ativo do funcionário:', err);
//         res.status(500).send('Erro ao atualizar o ativo do funcionário.');
//     }
// });


// // Função genérica para atualizar as informações de um ativo
// async function updateAtivo(cpf, ativo, dadosAtivo) {
//     const db = client.db(dbName);
//     const update = {};
//     update[ativo] = dadosAtivo;

//     const result = await db.collection(collectionName).updateOne(
//         { CPF: cpf },
//         { $set: update }
//     );

//     return result;
// }

// // Função genérica para limpar as informações de um ativo
// async function clearAtivo(cpf, ativo) {
//     const db = client.db(dbName);
//     const update = {};

//     // Define as informações padrão para cada tipo de ativo
//     switch (ativo) {
//         case 'Monitor1':
//         case 'Monitor2':
//         case 'Teclado':
//         case 'Mouse':
//         case 'Headset':
//         case 'Celular':
//             update[ativo] = {
//                 Presente: "NÃO",
//                 Modelo: "",
//                 'Número de Série': "",
//                 Observação: ""
//             };
//             break;
//         case 'Desktop':
//             update[ativo] = {
//                 Presente: "NÃO",
//                 TAG: "",
//                 Modelo: "",
//                 'Número de Série': "",
//                 Versão: "",
//                 Características: "",
//                 Observação: ""
//             };
//             break;
//         case 'Acessórios':
//             update[ativo] = {
//                 Presente: "NÃO",
//                 'Suporte notebook': "",
//                 'Mouse pad': "",
//                 Observação: ""
//             };
//             break;
//         case 'Nobreak':
//             update[ativo] = {
//                 Presente: "NÃO",
//                 Modelo: "",
//                 'Número de Série': "",
//                 Observação: ""
//             };
//             break;
//         default:
//             throw new Error('Ativo não reconhecido.');
//     }

//     const result = await db.collection(collectionName).updateOne(
//         { CPF: cpf },
//         { $set: update }
//     );

//     return result;
// }

// // Endpoints atualizados

// app.put('/notebook/:cpf', async (req, res) => {
//     try {
//         const { cpf } = req.params;
//         const { notebook } = req.body;
//         const result = await updateAtivo(cpf, 'Notebook', notebook);
//         res.status(200).json(result);
//     } catch (error) {
//         res.status(500).json({ message: 'Erro ao inserir notebook', error: error });
//     }
// });

// app.put('/clear_notebook/:cpf', async (req, res) => {
//     try {
//         const { cpf } = req.params;
//         const result = await clearAtivo(cpf, 'Notebook');
//         res.status(200).json(result);
//     } catch (error) {
//         res.status(500).json({ message: 'Erro ao limpar notebook', error: error });
//     }
// });



app.listen(port, () => {
    console.log(`Servidor rodando na porta`, port);
});
