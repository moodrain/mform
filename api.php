<?php
header('Content-Type: application/json');
if($_SERVER['REQUEST_METHOD'] == 'GET') {
    echo json_encode([
        'data' => [
            'sex' => 1
        ]
    ]);
 } else if($_SERVER['REQUEST_METHOD'] == 'POST') {
     echo json_encode([
        'code' => 200,
        'msg' => '',
        'data' => null, 
     ]);
 }