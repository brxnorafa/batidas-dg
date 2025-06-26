<?php
header('Content-Type: application/json; charset=utf-8');
include '../config/conn.php';

try {
    $tipo = $_GET['tipo'] ?? 'hoje'; // hoje, semana, mes, geral

    // Função para montar WHERE conforme coluna e tipo
    function getWhereClause(string $tipo, string $col): string {
        if ($tipo === 'hoje') {
            return "WHERE DATE($col) = CURDATE()";
        } elseif ($tipo === 'semana') {
            return "WHERE YEARWEEK($col, 1) = YEARWEEK(CURDATE(), 1)";
        } elseif ($tipo === 'mes') {
            return "WHERE MONTH($col) = MONTH(CURDATE()) AND YEAR($col) = YEAR(CURDATE())";
        }
        return ''; // geral sem filtro
    }

    // Pedidos
    $wherePedidos = getWhereClause($tipo, 'created_at');
    $sqlPedidos = "
        SELECT 
            SUM(status = 'finished') AS finalizados,
            SUM(status = 'cancelled') AS cancelados,
            COUNT(*) AS total
        FROM orders
        $wherePedidos";
    $pedidos = $pdo->query($sqlPedidos)->fetch(PDO::FETCH_ASSOC);

    // Pagamentos
    $wherePagamentos = getWhereClause($tipo, 'created_at');
    $sqlPagamentos = "
        SELECT 
            payment_method,
            SUM(amount) AS total
        FROM payments
        $wherePagamentos
        GROUP BY payment_method";
    $stmtPag = $pdo->query($sqlPagamentos);
    $pagamentos = [
        'Cartão Crédito' => 0,
        'Cartão Débito' => 0,
        'Pix' => 0,
        'Fiado' => 0,
        'Dinheiro' => 0,
    ];
    $valorTotal = 0;
    foreach ($stmtPag as $row) {
        $metodo = $row['payment_method'];
        $valor = (float)$row['total'];
        if (isset($pagamentos[$metodo])) {
            $pagamentos[$metodo] += $valor;
        }
        $valorTotal += $valor;
    }

    // Clientes cadastrados
    $whereClientes = getWhereClause($tipo, 'created_at');
    $sqlClientes = "SELECT COUNT(*) AS total FROM customers $whereClientes";
    $clientes = $pdo->query($sqlClientes)->fetchColumn();

    // Entradas (check-ins)
    $whereEntradas = getWhereClause($tipo, 'check_in_date');
    $sqlEntradas = "SELECT COUNT(*) AS total FROM check_ins $whereEntradas";
    $entradas = $pdo->query($sqlEntradas)->fetchColumn();

    echo json_encode([
        'success' => true,
        'pedidos' => $pedidos,
        'pagamentos' => $pagamentos,
        'valorTotal' => number_format($valorTotal, 2, ',', '.'),
        'clientes' => $clientes,
        'entradas' => $entradas
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
