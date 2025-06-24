<?php
header('Content-Type: application/json');
include '../config/conn.php';

// Métodos aceitos: POST e GET
$method = $_SERVER['REQUEST_METHOD'];


if ($method === 'POST') {
  $data = json_decode(file_get_contents("php://input"), true);
  if (!isset($data['action'])) {
    echo json_encode(['success' => false, 'message' => 'Ação não informada.']);
    exit;
  }

  $action = $data['action'];

  if ($action === 'cadastrar') {
    // Validar dados
    if (empty($data['nome']) || empty($data['telefone']) || empty($data['cpf']) || empty($data['nascimento'])) {
      echo json_encode(['success' => false, 'message' => 'Preencha todos os campos.']);
      exit;
    }

    // Limpar telefone e adicionar o DDI 55
    $telefoneLimpo = preg_replace('/\D/', '', $data['telefone']);
    $telefoneFinal = '55' . $telefoneLimpo;

    // Cadastro no banco
    try {
      $stmt = $pdo->prepare("INSERT INTO customers (name, cpf, phone, birth_date) VALUES (?, ?, ?, ?)");
      $stmt->execute([$data['nome'], $data['cpf'], $telefoneFinal, $data['nascimento']]);
      echo json_encode(['success' => true, 'message' => 'Cliente cadastrado com sucesso!']);
    } catch (PDOException $e) {
      if ($e->getCode() == 23000) {
        echo json_encode(['success' => false, 'message' => 'CPF já cadastrado.']);
      } else {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
      }
    }
    exit;
  }

  if ($action === 'registrar') {
    if (empty($data['cpf'])) {
      echo json_encode(['success' => false, 'message' => 'Informe o CPF.']);
      exit;
    }

    $cpf = $data['cpf'];

    // Verifica se o CPF existe na tabela de clientes
    $check = $pdo->prepare("SELECT * FROM customers WHERE cpf = ?");
    $check->execute([$cpf]);

    $clienteExiste = $check->rowCount() > 0;

    // Registra a entrada de qualquer forma
    $stmt = $pdo->prepare("INSERT INTO check_ins (cpf, check_in_date) VALUES (?, CURDATE())");
    $stmt->execute([$cpf]);

    if ($clienteExiste) {
      echo json_encode(['success' => true, 'message' => 'Entrada registrada com sucesso!']);
    } else {
      echo json_encode(['success' => true, 'message' => 'Entrada registrada, mas o CPF não está cadastrado.']);
    }

    exit;
  }

  echo json_encode(['success' => false, 'message' => 'Ação inválida.']);
  exit;
}

if ($method === 'GET') {
  if (!isset($_GET['cpf'])) {
    echo json_encode(['success' => false, 'message' => 'Informe o CPF.']);
    exit;
  }

  $cpf = $_GET['cpf'];

  $stmt = $pdo->prepare("SELECT * FROM check_ins WHERE cpf = ? AND check_in_date = CURDATE()");
  $stmt->execute([$cpf]);

  if ($stmt->rowCount() > 0) {
    echo json_encode(['success' => true, 'message' => 'Entrada já registrada hoje.']);
  } else {
    echo json_encode(['success' => false, 'message' => 'Nenhuma entrada registrada para hoje.']);
  }
  exit;
}

echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
exit;
