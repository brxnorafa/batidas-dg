<?php
header('Content-Type: application/json');
include '../config/conn.php';

// Função helper pra pegar dados do PUT e DELETE
function getInputData()
{
    $input = file_get_contents("php://input");
    return json_decode($input, true);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Cadastrar
    $data = json_decode(file_get_contents("php://input"), true);
    $nome = trim($data['nome'] ?? '');
    $unidade = trim($data['unidade'] ?? '');
    $quantidade = isset($data['quantidade']) ? floatval($data['quantidade']) : 0;

    if (!$nome || !$unidade) {
        echo json_encode(['success' => false, 'message' => 'Nome e unidade são obrigatórios.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO supplies (name, unit, total_quantity) VALUES (?, ?, ?)");
        $stmt->execute([$nome, $unidade, $quantidade]);
        echo json_encode(['success' => true, 'message' => 'Insumo cadastrado com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao cadastrar insumo: ' . $e->getMessage()]);
    }
    exit;
}

if ($method === 'GET') {
    // Listar insumos
    $action = $_GET['action'] ?? '';
    if ($action === 'listar') {
        try {
            $stmt = $pdo->query("SELECT id, name, unit, total_quantity FROM supplies WHERE active = 1 ORDER BY name ASC");
            $insumos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'insumos' => $insumos]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Erro ao listar insumos: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Ação inválida']);
    }
    exit;
}

if ($method === 'PUT') {
    // Editar insumo (só nome e unidade)
    parse_str($_SERVER['QUERY_STRING'], $query);
    $id = intval($query['id'] ?? 0);
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID inválido.']);
        exit;
    }

    $data = getInputData();
    $nome = trim($data['nome'] ?? '');
    $unidade = trim($data['unidade'] ?? '');

    if (!$nome || !$unidade) {
        echo json_encode(['success' => false, 'message' => 'Nome e unidade são obrigatórios.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE supplies SET name = ?, unit = ? WHERE id = ?");
        $stmt->execute([$nome, $unidade, $id]);
        echo json_encode(['success' => true, 'message' => 'Insumo atualizado com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar insumo: ' . $e->getMessage()]);
    }
    exit;
}

if ($method === 'DELETE') {
    // Desativar insumo (soft delete)
    parse_str($_SERVER['QUERY_STRING'], $query);
    $id = intval($query['id'] ?? 0);
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID inválido.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE supplies SET active = 0 WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Insumo desativado com sucesso!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao desativar insumo: ' . $e->getMessage()]);
    }
    exit;
}

// Caso método não suportado
echo json_encode(['success' => false, 'message' => 'Método não suportado.']);
exit;
