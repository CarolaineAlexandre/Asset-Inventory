# Inventory Management API

This repository contains code for an Inventory Management API. It's designed to help manage inventory items associated with employees.

## Getting Started

To get started with this API, follow these steps:

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Install dependencies by running:
   ```
   npm install
   ```
4. Start the database and API server by running:
   ```
   node database.js
   ```

## API Endpoints

### Funcionário (Employee)

- **GET funcionarios**: Retrieve all employees' information.
  - Endpoint: `http://localhost:8001/funcionarios`

- **DELETE deletar**: Delete an employee by their ID.
  - Endpoint: `http://localhost:8001/funcionario/{employee_id}`

- **POST inserir**: Add a new employee.
  - Endpoint: `http://localhost:8001/funcionario`

- **POST inserirFuncionario_validacao**: Add a new employee with validation.
  - Endpoint: `http://localhost:8001/funcionario`

- **POST inserirFuncionario_excluir**: Add a new employee and exclude some items.
  - Endpoint: `http://localhost:8001/funcionario`

- **PUT atualizar**: Update an employee's name by their CPF.
  - Endpoint: `http://localhost:8001/funcionario/{cpf}`

### Produtos Inventário (Inventory Products)

#### Notebook

- **PUT atualizar**: Update notebook information for a specific employee.
  - Endpoint: `http://localhost:8001/funcionario/{cpf}/ativo/Notebook`

- **PUT limparAtivo**: Clear notebook information for a specific employee.
  - Endpoint: `http://localhost:8001/funcionario/{cpf}/limpar-ativo/Notebook`

#### Similar Endpoints for Other Inventory Items

For other inventory items like Monitor1, Monitor2, Teclado, Mouse, Nobreak, Desktop, Headset, Celular, and Acessórios, there are similar endpoints for updating and clearing information specific to an employee. Replace `{item}` in the endpoint URLs with the corresponding item name.
