<?php
session_start();
if(isset($_REQUEST['data'])) {
    $products = array();
    $data = $_REQUEST['data'];
    stripslashes_array($data);
    foreach ($data['product'] as $product) {
        if (!empty($product['manufacturer'])) {
            $products[] = $product;
        }
    }
    unset($_REQUEST['data']['product']);
    $_SESSION['data'] = $data;
    $_SESSION['data']['product'] = $products;
}
function stripslashes_array(&$arr) {
        foreach ($arr as $k => &$v) {
            $nk = stripslashes($k);
            if ($nk != $k) {
                $arr[$nk] = &$v;
                unset($arr[$k]);
            }
            if (is_array($v)) {
                stripslashes_array($v);
            } else {
                $arr[$nk] = stripslashes($v);
            }
        }
    }

?>