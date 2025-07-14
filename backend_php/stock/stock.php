<?php
header('Content-Type: application/json');
include '../config/conn.php'; // conecta PDO

$method = $_SERVER['REQUEST_METHOD'];

function resposta($success, $message, $data = [])
{
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $data));
    exit;
}

// Mapeamento dos tipos do front para os do banco
function mapTipoMovimentacao(string $tipoFront): ?string
{
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
                // Pega todos os insumos ativos e a quantidade atual direto da tabela supplies
                $sql = "SELECT id, name, unit, total_quantity AS quantity FROM supplies WHERE active = 1 ORDER BY name";
                $stmt = $pdo->query($sql);
                $supplies = $stmt->fetchAll(PDO::FETCH_ASSOC);

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
        } elseif ($action === 'estoque_negativo') {
            try {
                $sql = "SELECT id, name, unit, total_quantity AS quantity 
                FROM supplies 
                WHERE active = 1 AND total_quantity <= 20
                ORDER BY name";
                $stmt = $pdo->query($sql);
                $estoqueCritico = $stmt->fetchAll(PDO::FETCH_ASSOC);

                resposta(true, "Estoque crítico listado com sucesso.", ['estoque_critico' => $estoqueCritico]);
            } catch (Exception $e) {
                resposta(false, "Erro ao buscar estoque crítico: " . $e->getMessage());
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
        // Inicia transação para garantir atomicidade
        $pdo->beginTransaction();

        // Insere a movimentação
        $sql = "INSERT INTO stock_movements (supply_id, movement_type, quantity, observation, created_at) 
                VALUES (:supply_id, :movement_type, :quantity, :observation, NOW())";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':supply_id' => $supply_id,
            ':movement_type' => $tipo,
            ':quantity' => $quantidade,
            ':observation' => $observacao,
        ]);

        // Atualiza o total_quantity conforme o tipo
        if ($tipo === 'purchase') {
            // Entrada: soma a quantidade
            $sqlUpdate = "UPDATE supplies SET total_quantity = total_quantity + :quantidade WHERE id = :supply_id";
            $stmtUpdate = $pdo->prepare($sqlUpdate);
            $stmtUpdate->execute([':quantidade' => $quantidade, ':supply_id' => $supply_id]);
        } elseif ($tipo === 'sale') {
            // Saída: subtrai a quantidade
            // Verifica estoque atual antes de subtrair para evitar negativo
            $sqlCheck = "SELECT total_quantity FROM supplies WHERE id = :supply_id";
            $stmtCheck = $pdo->prepare($sqlCheck);
            $stmtCheck->execute([':supply_id' => $supply_id]);
            $estoqueAtual = $stmtCheck->fetchColumn();

            if ($estoqueAtual === false) {
                $pdo->rollBack();
                resposta(false, "Insumo não encontrado.");
            }

            if ($estoqueAtual < $quantidade) {
                $pdo->rollBack();
                resposta(false, "Quantidade insuficiente no estoque para saída.");
            }

            $sqlUpdate = "UPDATE supplies SET total_quantity = total_quantity - :quantidade WHERE id = :supply_id";
            $stmtUpdate = $pdo->prepare($sqlUpdate);
            $stmtUpdate->execute([':quantidade' => $quantidade, ':supply_id' => $supply_id]);
        } elseif ($tipo === 'adjustment') {
            // Ajuste: seta o total_quantity para o valor exato informado em quantity
            $sqlUpdate = "UPDATE supplies SET total_quantity = :quantidade WHERE id = :supply_id";
            $stmtUpdate = $pdo->prepare($sqlUpdate);
            $stmtUpdate->execute([':quantidade' => $quantidade, ':supply_id' => $supply_id]);
        }

        // Finaliza transação
        $pdo->commit();

        resposta(true, "Movimentação registrada com sucesso.");
    } catch (Exception $e) {
        $pdo->rollBack();
        resposta(false, "Erro ao registrar movimentação: " . $e->getMessage());
    }
} else {
    resposta(false, "Método HTTP não suportado.");
}
