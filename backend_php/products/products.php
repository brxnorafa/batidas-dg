<?php
header('Content-Type: application/json');
include '../config/conn.php'; // Ajuste o caminho conforme sua estrutura

// Função pra responder JSON e sair
function responder($success, $message, $extra = [])
{
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message
    ], $extra));
    exit;
}

$action = $_GET['action'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'categorias') {
        // Listar categorias
        try {
            $stmt = $pdo->query("SELECT id, name FROM categories ORDER BY name ASC");
            $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

            responder(true, "Categorias carregadas", ['categorias' => $categorias]);
        } catch (Exception $e) {
            responder(false, "Erro ao buscar categorias: " . $e->getMessage());
        }
    }

    if ($action === 'listar_produtos') {
        try {
            $stmt = $pdo->query("SELECT id, name AS nome FROM products ORDER BY name ASC");
            $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            responder(true, "Produtos carregados", ['produtos' => $produtos]);
        } catch (Exception $e) {
            responder(false, "Erro ao buscar produtos: " . $e->getMessage());
        }
    }

    // Se não bateu com nenhuma ação válida GET
    responder(false, "Ação GET inválida");
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) responder(false, "Dados inválidos");

    $action = $data['action'] ?? null;

    if ($action === 'cadastrar_categoria') {
        $nome = trim($data['nome'] ?? '');
        if (!$nome) responder(false, "Nome da categoria não informado");

        try {
            // Checar se já existe categoria com esse nome (case insensitive)
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM categories WHERE LOWER(name) = LOWER(?)");
            $stmt->execute([$nome]);
            if ($stmt->fetchColumn() > 0) {
                responder(false, "Categoria já existe");
            }

            // Inserir categoria
            $stmt = $pdo->prepare("INSERT INTO categories (name) VALUES (?)");
            $stmt->execute([$nome]);

            responder(true, "Categoria cadastrada com sucesso");
        } catch (Exception $e) {
            responder(false, "Erro ao cadastrar categoria: " . $e->getMessage());
        }
    }

    if ($action === 'excluir_categoria') {
        $id = $data['id'] ?? null;
        if (!$id) responder(false, "ID da categoria não informado");

        try {
            $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
            $result = $stmt->execute([$id]);

            if ($result) {
                responder(true, "Categoria excluída com sucesso");
            } else {
                responder(false, "Erro ao excluir categoria");
            }
        } catch (Exception $e) {
            responder(false, "Erro ao excluir categoria: " . $e->getMessage());
        }
    }

    if ($action === 'excluir_produto') {
        $id = $data['id'] ?? null;
        if (!$id) responder(false, "ID do produto não informado");

        try {
            $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
            $result = $stmt->execute([$id]);

            if ($result) {
                responder(true, "Produto excluído com sucesso");
            } else {
                responder(false, "Erro ao excluir produto");
            }
        } catch (Exception $e) {
            responder(false, "Erro ao excluir produto: " . $e->getMessage());
        }
    }

    if ($action === 'salvar_produto') {
        $nome = trim($data['nome'] ?? '');
        $preco = $data['preco'] ?? null;
        $categoriaId = $data['categoriaSelecionada'] ?? null;
        $insumosObrigatorios = $data['insumosObrigatorios'] ?? [];
        $insumosOpcionais = $data['insumosOpcionais'] ?? [];

        if (!$nome) responder(false, "Nome do produto não informado");
        if ($preco === null || !is_numeric($preco)) responder(false, "Preço inválido");
        if (!$categoriaId) responder(false, "Categoria não informada");

        try {
            $pdo->beginTransaction();

            // Inserir produto
            $stmt = $pdo->prepare("INSERT INTO products (name, price, category_id) VALUES (?, ?, ?)");
            $stmt->execute([$nome, $preco, $categoriaId]);
            $produtoId = $pdo->lastInsertId();

            // Insumos obrigatórios (product_supplies)
            $stmtPS = $pdo->prepare("INSERT INTO product_supplies (product_id, supply_id, quantity_used) VALUES (?, ?, ?)");
            foreach ($insumosObrigatorios as $insumo) {
                if (!isset($insumo['id'], $insumo['quantidade']) || $insumo['quantidade'] <= 0) {
                    $pdo->rollBack();
                    responder(false, "Insumos obrigatórios com dados inválidos");
                }
                $stmtPS->execute([$produtoId, $insumo['id'], $insumo['quantidade']]);
            }

            // Insumos opcionais (product_optional_supplies)
            $stmtPOS = $pdo->prepare("INSERT INTO product_optional_supplies (product_id, supply_id) VALUES (?, ?)");
            foreach ($insumosOpcionais as $insumo) {
                if (!isset($insumo['id'])) {
                    $pdo->rollBack();
                    responder(false, "Insumos opcionais com dados inválidos");
                }
                $stmtPOS->execute([$produtoId, $insumo['id']]);
            }

            $pdo->commit();

            responder(true, "Produto cadastrado com sucesso", ['produtoId' => $produtoId]);
        } catch (Exception $e) {
            $pdo->rollBack();
            responder(false, "Erro ao cadastrar produto: " . $e->getMessage());
        }
    }

    // Se ação POST inválida
    responder(false, "Ação POST inválida");
}

// Se ação geral inválida
responder(false, "Ação inválida");
