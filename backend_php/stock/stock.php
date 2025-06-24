<?php
header('Content-Type: application/json');
include '../config/conn.php'; // conecta PDO

$method = $_SERVER['REQUEST_METHOD'];

function resposta($success, $message, $data = []) {
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $data));
    exit;
}

// Mapeamento dos tipos do front para os do banco
function mapTipoMovimentacao(string $tipoFront): ?string {
    $map = [
        'entrada' => 'purchase',
        'saida' => 'sale',
        'ajuste' => 'adjustment',
        'purchase' => 'purchase',
        'sale' => 'sale',
        'adjustment' => 'adjustment',
    ];
    return $map[$tipoFront] ?? null;
}

if ($method === 'GET') {
    if (isset($_GET['action'])) {
        $action = $_GET['action'];

        if ($action === 'estoque') {
            try {
                // Pega todos os insumos ativos
                $sql = "SELECT id, name, unit FROM supplies WHERE active = 1 ORDER BY name";
                $stmt = $pdo->query($sql);
                $supplies = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Para cada insumo, calcula a quantidade atual baseado em stock_movements
                foreach ($supplies as &$supply) {
                    $sqlMov = "SELECT
                        COALESCE(SUM(CASE WHEN movement_type = 'purchase' THEN quantity ELSE 0 END),0) AS entradas,
                        COALESCE(SUM(CASE WHEN movement_type = 'sale' THEN quantity ELSE 0 END),0) AS saidas,
                        COALESCE(MAX(CASE WHEN movement_type = 'adjustment' THEN quantity ELSE NULL END), NULL) AS ajuste
                        FROM stock_movements WHERE supply_id = :supply_id";

                    $stmtMov = $pdo->prepare($sqlMov);
                    $stmtMov->execute([':supply_id' => $supply['id']]);
                    $mov = $stmtMov->fetch(PDO::FETCH_ASSOC);

                    if ($mov['ajuste'] !== null) {
                        $quantidadeAtual = floatval($mov['ajuste']);
                    } else {
                        $quantidadeAtual = floatval($mov['entradas']) - floatval($mov['saidas']);
                    }
                    $supply['quantity'] = $quantidadeAtual;
                }

                resposta(true, "Estoque listado com sucesso.", ['estoque' => $supplies]);
            } catch (Exception $e) {
                resposta(false, "Erro ao buscar estoque: " . $e->getMessage());
            }
        } elseif ($action === 'movimentacoes' && isset($_GET['insumo_id'])) {
            $insumo_id = intval($_GET['insumo_id']);
            try {
                $sql = "SELECT movement_type, quantity, observation, created_at 
                        FROM stock_movements 
                        WHERE supply_id = :insumo_id
                        ORDER BY created_at DESC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([':insumo_id' => $insumo_id]);
                $movimentacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);

                resposta(true, "Movimentações carregadas com sucesso.", ['movimentacoes' => $movimentacoes]);
            } catch (Exception $e) {
                resposta(false, "Erro ao buscar movimentações: " . $e->getMessage());
            }
        } else {
            resposta(false, "Ação GET inválida.");
        }
    } else {
        resposta(false, "Parâmetro action não informado.");
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) resposta(false, "Dados inválidos.");

    $action = $data['action'] ?? '';
    if ($action !== 'registrar') resposta(false, "Ação POST inválida.");

    $supply_id = $data['insumo_id'] ?? null;
    $tipoFront = $data['tipo'] ?? null;
    $quantidade = $data['quantidade'] ?? null;
    $observacao = $data['observacao'] ?? '';

    if (!$supply_id || !$tipoFront || !is_numeric($supply_id)) {
        resposta(false, "ID do insumo inválido.");
    }

    $tipo = mapTipoMovimentacao($tipoFront);
    if (!$tipo) {
        resposta(false, "Tipo de movimentação inválido.");
    }

    if (!is_numeric($quantidade) || $quantidade <= 0) {
        resposta(false, "Quantidade inválida.");
    }

    try {
        $sql = "INSERT INTO stock_movements (supply_id, movement_type, quantity, observation, created_at) VALUES (:supply_id, :movement_type, :quantity, :observation, NOW())";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':supply_id' => $supply_id,
            ':movement_type' => $tipo,
            ':quantity' => $quantidade,
            ':observation' => $observacao,
        ]);
        resposta(true, "Movimentação registrada com sucesso.");
    } catch (Exception $e) {
        resposta(false, "Erro ao registrar movimentação: " . $e->getMessage());
    }
} else {
    resposta(false, "Método HTTP não suportado.");
}
