<?php
header('Content-Type: application/json');
include '../config/conn.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username']) || !isset($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Dados incompletos.']);
    exit;
}

$username = $data['username'];
$password = $data['password'];

try {
       $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username LIMIT 1");
       $stmt->execute([':username' => $username]);
       $user = $stmt->fetch(PDO::FETCH_ASSOC);

       if ($user && password_verify($password, $user['password_hash'])) {
              // login ok
              echo json_encode([
                     'success' => true,
                     'role' => $user['role']
              ]);
       } else {
              // login error
              echo json_encode([
                     'success' => false,
                     'message' => 'Usuário ou senha inválidos.'
              ]);
       }
} catch (PDOException $e) {
       echo json_encode([
              'success' => false,
              'message' => 'Erro na consulta ao banco.'
       ]);
}
?>