# 🍹 Batidas DG - Sistema de Gerenciamento de Pedidos

Sistema web desenvolvido como  projeto freelancer para o bar **Batidas DG**, com o objetivo de agilizar o atendimento, registrar pedidos e organizar a operação de vendas com relatórios e controle.

---

## ✨ Funcionalidades

- Cadastro e gerenciamento de pedidos
- Seleção de bebidas com adicionais (energético com sabores diversos, gelos, etc...)
- Relatórios com total de vendas, entradas (portaria), pagamentos
- Geração de PDF's

---

## ⚙️ Tecnologias Utilizadas
- **Frontend:** React + Vite + TailwindCSS
- **Backend:** PHP (API REST) + MySQL
- **Banco de Dados:** MySQL (`src/public/init.sql`)

---

## 🚀 Como Rodar o Projeto

### 🔧 Pré-requisitos

- Node.js 
- PHP
- MySQL
- XAMPP ou semelhante (para simular o ambiente local)

---

### 🔁 Backend (PHP + MySQL)

1.  Inicie o servidor Apache e MySQL (via XAMPP, WAMP, etc..)
2.  Execute o script SQL para criar o banco e as tabelas:
```sql
-- via phpMyAdmin ou terminal MySQL
source src/public/init.sql
```
3. Coloque o projeto em uma pasta acessível pelo servidor (ex: htdocs/batidas-dg)

### 🌐 Frontend (React + Vite)

1. Instale as dependências `npm install`
2. Rode o servidor de desenvolvimento `npm run dev`
3. Acesse o sistema no link fornecido pelo vite. Ex: http://localhost:5173


---
🧠 Autores
Softwave - Especializados em Software por Demanda
(**Bruno Rafael (/brxnorafa)** & **Nicolas Marques**)

📃 Licença
Este projeto é de uso privado para o bar Batidas DG, mas o código pode servir como referência ou base para projetos similares.
---




