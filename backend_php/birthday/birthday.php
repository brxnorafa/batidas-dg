<?php
header('Content-Type: application/json; charset=utf-8');

include '../config/conn.php';

try {
    $hoje = new DateTime();

    $quinzeDias = (clone $hoje)->modify('+15 days')->format('m-d');
    $umMes = (clone $hoje)->modify('+1 month')->format('m-d');

    $sql = "
        SELECT name, phone,
            CASE 
                WHEN DATE_FORMAT(birth_date, '%m-%d') = :quinze THEN 'quinze'
                WHEN DATE_FORMAT(birth_date, '%m-%d') = :umMes THEN 'mes'
                ELSE NULL
            END AS tipo
        FROM customers
        WHERE (DATE_FORMAT(birth_date, '%m-%d') = :quinze OR DATE_FORMAT(birth_date, '%m-%d') = :umMes)
          AND phone IS NOT NULL AND phone != ''
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':quinze', $quinzeDias);
    $stmt->bindValue(':umMes', $umMes);
    $stmt->execute();

    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Filtra só os que tem tipo válido (quinze ou mes)
    $aniversariantes = array_filter($resultados, function ($p) {
        return in_array($p['tipo'], ['quinze', 'mes']);
    });

    echo json_encode(array_values($aniversariantes));

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro no servidor: ' . $e->getMessage()]);
}
