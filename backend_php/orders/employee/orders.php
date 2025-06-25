<?php
header("Content-Type: application/json");
include '../../config/conn.php';

$action = $_GET["action"] ?? $_POST["action"] ?? "";

switch ($action) {
  case "listar_produtos":
    listarProdutos($pdo);
    break;

  case "insumos_opcionais":
    $produto_id = intval($_GET["produto_id"] ?? 0);
    listarOpcionais($pdo, $produto_id);
    break;

  case "listar_categorias":
    listarCategorias($pdo);
    break;

  case "salvar_pedido":
    registrarPedido($pdo);
    break;


  default:
    echo json_encode(["success" => false, "message" => "Ação inválida"]);
    break;
}


function registrarPedido(PDO $pdo) {
  $input = json_decode(file_get_contents("php://input"), true);

  $cliente = trim($input["clienteNome"] ?? "");
  $pagamento = $input["pagamento"] ?? "Desconhecido";
  $total = floatval($input["total"] ?? 0);
  $itens = $input["itens"] ?? [];

  if (empty($itens)) {
    echo json_encode(["success" => false, "message" => "Carrinho vazio"]);
    return;
  }

  try {
    $pdo->beginTransaction();

    // 📦 Cria o pedido
    $stmt = $pdo->prepare("INSERT INTO orders (total, customer_name) VALUES (?, ?)");
    $stmt->execute([$total, $cliente]);
    $orderId = $pdo->lastInsertId();

    // 🧾 Adiciona os itens
    foreach ($itens as $item) {
      $produtoId = $item["produtoId"];
      $quantidade = $item["quantidade"];

      // 🔍 Busca o preço atual do produto
      $stmtProduto = $pdo->prepare("SELECT price FROM products WHERE id = ?");
      $stmtProduto->execute([$produtoId]);
      $produto = $stmtProduto->fetch(PDO::FETCH_ASSOC);
      if (!$produto) throw new Exception("Produto ID $produtoId não encontrado.");
      $unitPrice = $produto["price"];

      $stmtItem = $pdo->prepare("
        INSERT INTO order_items (order_id, product_id, quantity, unit_price)
        VALUES (?, ?, ?, ?)
      ");
      $stmtItem->execute([$orderId, $produtoId, $quantidade, $unitPrice]);
      $orderItemId = $pdo->lastInsertId();

      // 🔧 Insumos obrigatórios
      $stmtInsumos = $pdo->prepare("
        SELECT supply_id, quantity_used
        FROM product_supplies
        WHERE product_id = ?
      ");
      $stmtInsumos->execute([$produtoId]);
      $insumosObrigatorios = $stmtInsumos->fetchAll(PDO::FETCH_ASSOC);

      foreach ($insumosObrigatorios as $insumo) {
        $qtdTotal = $insumo["quantity_used"] * $quantidade;
        $stmtSup = $pdo->prepare("
          INSERT INTO order_item_supplies (order_item_id, supply_id, quantity)
          VALUES (?, ?, ?)
        ");
        $stmtSup->execute([$orderItemId, $insumo["supply_id"], $qtdTotal]);

        // // Diminui do estoque
        // $pdo->prepare("
        //   INSERT INTO stock_movements (supply_id, quantity, movement_type, observation)
        //   VALUES (?, ?, 'sale', 'Venda via pedido #$orderId')
        // ")->execute([$insumo["supply_id"], -$qtdTotal]);
      }

      // 🧂 Insumos opcionais
      foreach ($item["opcionais"] ?? [] as $opcional) {
        $supplyId = $opcional["supplyId"];
        $qtd = $opcional["quantidade"];
        $qtdTotal = $qtd * $quantidade;

        $stmtOpc = $pdo->prepare("
          INSERT INTO order_item_supplies (order_item_id, supply_id, quantity)
          VALUES (?, ?, ?)
        ");
        $stmtOpc->execute([$orderItemId, $supplyId, $qtdTotal]);

        // // Diminui do estoque
        // $pdo->prepare("
        //   INSERT INTO stock_movements (supply_id, quantity, movement_type, observation)
        //   VALUES (?, ?, 'sale', 'Venda via pedido #$orderId')
        // ")->execute([$supplyId, -$qtdTotal]);
      }
    }

    // 💳 Pagamento
    $stmtPay = $pdo->prepare("
      INSERT INTO payments (order_id, payment_method, amount, status)
      VALUES (?, ?, ?, 'approved')
    ");
    $stmtPay->execute([$orderId, $pagamento, $total]);

    $pdo->commit();
    echo json_encode(["success" => true, "order_id" => $orderId]);

  } catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode([
      "success" => false,
      "message" => "Erro ao registrar pedido",
      "error" => $e->getMessage()
    ]);
  }
}



// 🛍️ Listar produtos ativos com categoria
function listarProdutos(PDO $pdo) {
  $sql = "
    SELECT
      p.id,
      p.name,
      p.price,
      p.category_id,
      c.name AS category,
      -- Verifica se algum insumo obrigatório está com estoque insuficiente
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM product_supplies ps
          JOIN supplies s ON s.id = ps.supply_id
          WHERE ps.product_id = p.id
          AND s.total_quantity < ps.quantity_used
        )
        THEN 0
        ELSE 1
      END AS has_stock
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.active = 1
    ORDER BY p.name
  ";

  $stmt = $pdo->query($sql);
  $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode(["success" => true, "produtos" => $produtos]);
}

// 🧪 Listar insumos opcionais de um produto
function listarOpcionais(PDO $pdo, int $produto_id) {
  if (!$produto_id) {
    echo json_encode(["success" => false, "message" => "ID do produto inválido"]);
    return;
  }

  $sql = "
    SELECT s.id, s.name, s.unit
    FROM product_optional_supplies pos
    JOIN supplies s ON s.id = pos.supply_id
    WHERE pos.product_id = :produto_id
  ";
  $stmt = $pdo->prepare($sql);
  $stmt->execute(['produto_id' => $produto_id]);

  $insumos = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode(["success" => true, "insumos" => $insumos]);
}

// 📂 Listar categorias
function listarCategorias(PDO $pdo) {
  $sql = "SELECT id, name FROM categories ORDER BY name";
  $stmt = $pdo->query($sql);
  $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode(["success" => true, "categorias" => $categorias]);
}
