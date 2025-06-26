-- Cria o banco e usa ele
CREATE DATABASE IF NOT EXISTS batidasdg_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE batidasdg_db;

-- Categorias de produtos
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Produtos
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  category_id INT,
  FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insumos (suprimentos)
CREATE TABLE supplies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  total_quantity DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Movimentações no estoque (compras, vendas, ajustes)
CREATE TABLE stock_movements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  supply_id INT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  movement_type ENUM('purchase','sale','adjustment') NOT NULL,
  observation VARCHAR(200),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supply_id) REFERENCES supplies(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Pedidos
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  total DECIMAL(10,2) NOT NULL,
  customer_name VARCHAR(200), -- pode deixar para informar nome na hora do pedido
  note VARCHAR(200),
  status ENUM('cancelled','finished','in_preparation') DEFAULT 'in_preparation',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Itens do pedido (produtos)
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insumos usados em cada item do pedido (obrigatórios + opcionais)
CREATE TABLE order_item_supplies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_item_id INT NOT NULL,
  supply_id INT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  FOREIGN KEY (supply_id) REFERENCES supplies(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insumos obrigatórios do produto (quantidade padrão usada)
CREATE TABLE product_supplies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  supply_id INT NOT NULL,
  quantity_used DECIMAL(10,3) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (supply_id) REFERENCES supplies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insumos opcionais do produto (sem quantidade fixa, pode variar na hora do pedido)
CREATE TABLE product_optional_supplies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  supply_id INT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (supply_id) REFERENCES supplies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Entradas
CREATE TABLE `check_ins` (
   `id` int(11) NOT NULL AUTO_INCREMENT,
   `cpf` varchar(14) DEFAULT NULL,
   `check_in_date` date DEFAULT NULL,
   PRIMARY KEY (`id`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Pagamentos relacionados a pedidos
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'approved',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  birth_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usuários do sistema
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Usuário admin padrão (senha bcrypt hash de 'admin123', pode trocar)
INSERT INTO users (username, password_hash, name, role)
VALUES ('admin', '$2y$10$NYp9m06WwzpYv93VGEuFu.BiF9DbuxCmI2XRjOMhsiHdazXgv.JFu', 'Admin Dev', 'administrator');
