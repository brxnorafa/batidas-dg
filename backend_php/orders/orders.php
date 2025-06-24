<?php
header('Content-Type: application/json');
include '../config/conn.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
       // return all orders in preparation
       $stmt = $pdo->prepare("
       SELECT * FROM orders
       WHERE status = 'in_preparation'
       ORDER BY created_at DESC
       ");
       $stmt->execute();
       $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

       // search items 
       foreach ($orders as &$order) {
              $itemStmt = $pdo->prepare("
              SELECT oi.*, p.name AS product_name
              FROM order_items oi
              LEFT JOIN products p ON p.id = oi.product_id
              WHERE oi.order_id = :order_id
              ");
              $itemStmt->execute([':order_id' => $order['id']]);
              $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

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

       if (in_array($action, ['cancel', 'finish'])) {
              if (!$orderId) {
                     echo json_encode(['success' => false, 'message' => 'Pedido não informado']);
                     exit;
              }

              $newStatus = $action === 'finish' ? 'finished' : 'cancelled';

              $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
              $stmt->execute([$newStatus, $orderId]);

              echo json_encode(['success' => true, 'message' => "Pedido #$orderId $newStatus com sucesso"]);
              exit;
       }

       if ($action === 'finish_all') {
              $stmt = $pdo->prepare("UPDATE orders SET status = 'finished' WHERE status = 'in_preparation'");
              $stmt->execute();

              echo json_encode(['success' => true, 'message' => 'Todos os pedidos finalizados']);
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
