<?php
header('Content-Type: application/json');
include '../config/conn.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
  case 'GET':
    $stmt = $pdo->query("SELECT id, username, name, role FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($users);
    break;

  case 'POST':
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data['username'] || !$data['name'] || !$data['password'] || !$data['role']) {
      echo json_encode(['success' => false, 'message' => 'Campos obrigatórios não enviados.']);
      exit;
    }

    $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);

    try {
      $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)");
      $success = $stmt->execute([$data['username'], $password_hash, $data['name'], $data['role']]);
      echo json_encode(['success' => $success]);
    } catch (PDOException $e) {
      echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
    break;

  case 'DELETE':
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id'])) {
      echo json_encode(['success' => false, 'message' => 'ID não enviado.']);
      exit;
    }

    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $success = $stmt->execute([$data['id']]);
    echo json_encode(['success' => $success]);
    break;

  default:
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
}
