<?php

define('DB_SERVER', 'localhost');
define('DB_USER', 'reklamasjondc');
define('DB_PASSWORD', 'MKv9vsEA82nR');
define('DB_NAME', 'reklamasjon');

$emails = array(
    'no' => 'warranty.no@defa.com',
    'sv' => 'warranty.se@defa.com',
    'fi' => 'warranty.fi@defa.com'
);

$emailsBcc = array(
    'anders.medhus@utforming.no',
//    'denis@onix-systems.com',
//    'sergey.filip@gmail.com'
);
if (isset($_REQUEST['lang']) && isset($emails[$_REQUEST['lang']])) {
    define('CURRENT_LANGUAGE', $_REQUEST['lang']);
} else {
    define('CURRENT_LANGUAGE', 'no');
}

//define('SUPPORT_EMAIL', $emails[CURRENT_LANGUAGE]);
switch(CURRENT_LANGUAGE) {
    case 'no':
        define('COUNTRY_PREFIX', 'N');
        break;
    case 'sv':
        define('COUNTRY_PREFIX', 'S');
        break;
    case 'fi':
        define('COUNTRY_PREFIX', 'F');
        break;
}

define('IS_SMTP', true);
define('SMTP_HOST', 'smtp.bewide.net');
define('SMTP_USER', 'web@defa.ds.bewide.net');
define('SMTP_PASSWORD', 'cP13WLaNve');
define('SMTP_PORT', 587);

define('SUPPORT_EMAIL', 'sergey.filip@gmail.com');
//define('PHPMAILER_DIR', dirname(__FILE__) .  DIRECTORY_SEPARATOR . 'vendor' .  DIRECTORY_SEPARATOR . 'phpmailer' . DIRECTORY_SEPARATOR . 'phpmailer' . DIRECTORY_SEPARATOR);
define('PHPMAILER_DIR', dirname(__FILE__) . DIRECTORY_SEPARATOR . 'phpmailer' . DIRECTORY_SEPARATOR);
define('PREVIEW_URL', 'http://www.defa.com/' . CURRENT_LANGUAGE . '/corporate/contact_and_support/automotive/return_form_preview');
function pr($data) {
    echo "<pre>";
    print_r($data);
    echo "</pre>";
}
?>