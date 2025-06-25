<?php
header('Content-Type: application/json');
include '../config/conn.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Pega todos os pedidos com status 'in_preparation'
    $stmt = $pdo->prepare("
        SELECT * FROM orders
        WHERE status = 'in_preparation'
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Para cada pedido, busca os itens e os opcionais
    foreach ($orders as &$order) {
        $itemStmt = $pdo->prepare("
            SELECT oi.*, p.name AS product_name
            FROM order_items oi
            LEFT JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = :order_id
        ");
        $itemStmt->execute([':order_id' => $order['id']]);
        $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($items as &$item) {
            $optionalsStmt = $pdo->prepare("
                SELECT ois.*, s.name AS supply_name
                FROM order_item_supplies ois
                LEFT JOIN supplies s ON s.id = ois.supply_id
                WHERE ois.order_item_id = ?
            ");
            $optionalsStmt->execute([$item['id']]);
            $item['optionals'] = $optionalsStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        $order['items'] = $items;
    }

    echo json_encode(['success' => true, 'orders' => $orders]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $orderId = $_POST['order_id'] ?? null;

    if (!in_array($action, ['cancel', 'finish', 'cancel_all', 'finish_all'])) {
        echo json_encode(['success' => false, 'message' => 'Ação inválida']);
        exit;
    }

    // Função para descontar insumos de um pedido específico
    function descontarInsumos(PDO $pdo, $orderId) {
    // Busca todos os itens do pedido
    $itemStmt = $pdo->prepare("SELECT id FROM order_items WHERE order_id = ?");
    $itemStmt->execute([$orderId]);
    $orderItems = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($orderItems as $item) {
        $orderItemId = $item['id'];

        // Busca todos os insumos do item (obrigatórios e opcionais)
        $suppliesStmt = $pdo->prepare("
            SELECT supply_id, quantity
            FROM order_item_supplies
            WHERE order_item_id = ?
        ");
        $suppliesStmt->execute([$orderItemId]);
        $supplies = $suppliesStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($supplies as $supply) {
            // Registra movimento negativo no estoque
            $insertStock = $pdo->prepare("
                INSERT INTO stock_movements (supply_id, quantity, movement_type, observation, created_at)
                VALUES (?, ?, 'sale', ?, NOW())
            ");
            $obs = "Venda via pedido #$orderId";
            $quantityToSubtract = $supply['quantity'];
            $insertStock->execute([$supply['supply_id'], -$quantityToSubtract, $obs]);

            // Atualiza o total_quantity na tabela supplies
            $updateSupply = $pdo->prepare("
                UPDATE supplies 
                SET total_quantity = total_quantity - :qtd
                WHERE id = :supply_id
            ");
            $updateSupply->execute([
                ':qtd' => $quantityToSubtract,
                ':supply_id' => $supply['supply_id'],
            ]);
        }
    }
}


    if (in_array($action, ['cancel', 'finish'])) {
        if (!$orderId) {
            echo json_encode(['success' => false, 'message' => 'Pedido não informado']);
            exit;
        }

        $pdo->beginTransaction();
        try {
            if ($action === 'finish') {
                // Atualiza status para finished
                $stmt = $pdo->prepare("UPDATE orders SET status = 'finished' WHERE id = ?");
                $stmt->execute([$orderId]);

                // Desconta insumos do estoque
                descontarInsumos($pdo, $orderId);
            } else {
                // Cancela pedido
                $stmt = $pdo->prepare("UPDATE orders SET status = 'cancelled' WHERE id = ?");
                $stmt->execute([$orderId]);
            }

            $pdo->commit();
            echo json_encode(['success' => true, 'message' => "Pedido #$orderId " . ($action === 'finish' ? 'finalizado' : 'cancelado') . " com sucesso"]);
        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar pedido: ' . $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'finish_all') {
        $pdo->beginTransaction();
        try {
            // Busca todos os pedidos em preparação
            $stmt = $pdo->prepare("SELECT id FROM orders WHERE status = 'in_preparation'");
            $stmt->execute();
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Para cada pedido, atualiza status e desconta insumos
            foreach ($orders as $order) {
                $orderId = $order['id'];
                $stmtUpdate = $pdo->prepare("UPDATE orders SET status = 'finished' WHERE id = ?");
                $stmtUpdate->execute([$orderId]);

                descontarInsumos($pdo, $orderId);
            }

            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Todos os pedidos finalizados']);
        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => 'Erro ao finalizar pedidos: ' . $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'cancel_all') {
        $stmt = $pdo->prepare("UPDATE orders SET status = 'cancelled' WHERE status = 'in_preparation'");
        $stmt->execute();
        echo json_encode(['success' => true, 'message' => 'Todos os pedidos cancelados']);
        exit;
    }
}

echo json_encode(['success' => false, 'message' => 'Método inválido']);
