<?php
session_start();
include 'config.php';

if(isset($_REQUEST['data'])) {
    $products = array();
    $data = $_REQUEST['data'];
    stripslashes_array($data);
    foreach ($data['product'] as $product) {
        if (!empty($product['defa_number'])) {
            $products[] = $product;
        }
    }
    unset($_REQUEST['data']['product']);
    $_SESSION['data'] = $data;
    $_SESSION['data']['product'] = $products;
    exit;
} elseif (isset($_REQUEST['send_inn'])) {
    if(!(isset($_SESSION['data']) && isset($_SESSION['data']['name']))) {
        echo json_encode(array('error' => true));
        exit;
    }
    Model::lockContacts();
    $contactId = Model::getNextId();
    if ($contactId) {
        $res = Model::saveData($contactId, $_SESSION['data']);
        Model::unlockContacts();
        if(!$res) {
            return false;
        }
        $uniqId = COUNTRY_PREFIX . (1000 + $contactId);
        $fileName = $uniqId . '.xml';
        file_put_contents(dirname(__FILE__) . DIRECTORY_SEPARATOR . 'tmp' . DIRECTORY_SEPARATOR . $fileName,  Xml::getXml($_SESSION['data']));
        sendEmail($_SESSION['data']['contact_email'], $uniqId, $fileName);
        if (isset($_SESSION['data']['remember']) && $_SESSION['data']['remember'] == 'on') {
            $_SESSION['data'] = array(
                'name' => $_SESSION['data']['name'],
                'address1' => $_SESSION['data']['address1'],
                'address2' => $_SESSION['data']['address2'],
                'address3' => $_SESSION['data']['address3'],
                'org_num' => $_SESSION['data']['org_num'],
                'contact_name' => $_SESSION['data']['contact_name'],
                'contact_email' => $_SESSION['data']['contact_email'],
                'contact_phone' => $_SESSION['data']['contact_phone'],
                'remember' => $_SESSION['data']['remember']
            );
        } else {
            $_SESSION['data'] = array();
        }
        echo json_encode(array('new_id' => $uniqId));
    } else {
        Model::unlockContacts();
    }
    exit;
} else if (isset($_GET['contact_id'])) {
    echo json_encode(Model::loadFromDb($_GET['contact_id']));
    exit;
} else if (isset($_SESSION['data'])) {
    echo(json_encode($_SESSION['data']));
    exit;
}

class Xml {
    static $template = <<<EOS
<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:html="http://www.w3.org/TR/REC-html40">
    <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
        <Author>Anders Knutson Medhus</Author>
        <LastAuthor>optimus optimus</LastAuthor>
        <Created>2014-04-08T16:54:49Z</Created>
        <LastSaved>2014-04-10T13:06:33Z</LastSaved>
        <Company>Utforming Medhus</Company>
        <Version>14.0</Version>
    </DocumentProperties>
    <OfficeDocumentSettings xmlns="urn:schemas-microsoft-com:office:office">
        <AllowPNG/>
    </OfficeDocumentSettings>
    <ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">
        <WindowHeight>9120</WindowHeight>
        <WindowWidth>27420</WindowWidth>
        <WindowTopX>1340</WindowTopX>
        <WindowTopY>0</WindowTopY>
        <ProtectStructure>False</ProtectStructure>
        <ProtectWindows>False</ProtectWindows>
    </ExcelWorkbook>
    <Styles>
        <Style ss:ID="Default" ss:Name="Normal">
            <Alignment ss:Vertical="Bottom"/>
            <Borders/>
            <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="12" ss:Color="#000000"/>
            <Interior/>
            <NumberFormat/>
            <Protection/>
        </Style>
        <Style ss:ID="s63">
            <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="12" ss:Color="#000000"/>
        </Style>
        <Style ss:ID="s64">
            <Alignment ss:Horizontal="Left" ss:Vertical="Top" ss:WrapText="1"/>
        </Style>
        <Style ss:ID="s65">
            <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>
        </Style>
        <Style ss:ID="s66">
            <Font ss:FontName="Calibri" ss:Size="12" ss:Color="#90713A"/>
        </Style>
        <Style ss:ID="s67">
            <Alignment ss:Horizontal="Left" ss:Vertical="Top" ss:WrapText="1"/>
            <Font ss:FontName="Calibri" ss:Size="12" ss:Color="#90713A"/>
        </Style>
        <Style ss:ID="s68">
            <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>
            <Font ss:FontName="Calibri" ss:Size="12" ss:Color="#90713A"/>
        </Style>
        <Style ss:ID="s69">
            <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="12" ss:Color="#000000"
            ss:Bold="1"/>
        </Style>
        <Style ss:ID="s74">
            <Font ss:FontName="Lucida Grande" ss:Size="11" ss:Color="#333333"/>
        </Style>
        <Style ss:ID="s77">
            <Font ss:FontName="Lucida Grande" ss:Size="11" ss:Color="#333333" ss:Bold="1"/>
            <NumberFormat ss:Format="Short Date"/>
        </Style>
        <Style ss:ID="s78">
            <Font ss:FontName="Lucida Grande" ss:Size="11" ss:Color="#333333"/>
            <NumberFormat ss:Format="@"/>
        </Style>
    </Styles>
    <Worksheet ss:Name="Ark1">
        <Table ss:ExpandedColumnCount="11" ss:ExpandedRowCount="20" x:FullColumns="1"
               x:FullRows="1" ss:DefaultColumnWidth="65" ss:DefaultRowHeight="15">
            <Column ss:StyleID="s63" ss:AutoFitWidth="0" ss:Width="129"/>
            <Column ss:StyleID="s64" ss:AutoFitWidth="0" ss:Width="130"/>
            <Column ss:StyleID="s65" ss:AutoFitWidth="0" ss:Width="130" ss:Span="1"/>
            <Column ss:Index="5" ss:StyleID="s65" ss:AutoFitWidth="0" ss:Width="129"/>
            <Column ss:StyleID="s65" ss:AutoFitWidth="0" ss:Width="131"/>
            <Column ss:StyleID="s64" ss:AutoFitWidth="0" ss:Width="131"/>
            <Column ss:StyleID="s65" ss:AutoFitWidth="0" ss:Width="130"/>
            <Column ss:StyleID="s65" ss:AutoFitWidth="0" ss:Width="128"/>
            <Column ss:StyleID="s64" ss:AutoFitWidth="0" ss:Width="131"/>
            <Row ss:AutoFitHeight="0" ss:StyleID="s66">
                <Cell ss:StyleID="s69"><Data ss:Type="String">Contact information</Data></Cell>
                <Cell ss:StyleID="s67"><Data ss:Type="String">Client name</Data></Cell>
                <Cell ss:StyleID="s68"><Data ss:Type="String">Address line 1</Data></Cell>
                <Cell ss:StyleID="s68"><Data ss:Type="String">Address line 2</Data></Cell>
                <Cell ss:StyleID="s68"><Data ss:Type="String">Address line 3</Data></Cell>
                <Cell ss:StyleID="s68"><Data ss:Type="String">Contact person</Data></Cell>
                <Cell ss:StyleID="s67"><Data ss:Type="String">Contact person e-mail</Data></Cell>
                <Cell ss:StyleID="s68"><Data ss:Type="String">Organization number</Data></Cell>
                <Cell ss:StyleID="s68"><Data ss:Type="String">Phone number</Data></Cell>
                <Cell ss:StyleID="s67"/>
            </Row>
            {{contactTemplate}}
            <Row ss:Index="4" ss:AutoFitHeight="0" ss:StyleID="s66">
                <Cell ss:StyleID="s69"><Data ss:Type="String">Credit Note</Data></Cell>
                <Cell ss:StyleID="s67"><Data ss:Type="String">E-mail-finance manager</Data></Cell>
                <Cell ss:StyleID="s68"><Data ss:Type="String">Reference number</Data></Cell>
                <Cell ss:StyleID="s68"><Data ss:Type="String">Bank account number</Data></Cell>
                <Cell ss:StyleID="s68"><Data ss:Type="String">Credit note</Data></Cell>
                <Cell ss:StyleID="s68"><Data ss:Type="String">Comments</Data></Cell>
                <Cell ss:StyleID="s67"/>
                <Cell ss:StyleID="s68"/>
                <Cell ss:StyleID="s68"/>
                <Cell ss:StyleID="s67"/>
            </Row>
            {{creditTemplate}}
            {{productData}}
        </Table>
        <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
            <PageSetup>
                <PageMargins x:Left="0.78740157499999996" x:Right="0.78740157499999996"/>
            </PageSetup>
            <Unsynced/>
            <Print>
                <ValidPrinterInfo/>
                <PaperSizeIndex>9</PaperSizeIndex>
                <HorizontalResolution>-4</HorizontalResolution>
                <VerticalResolution>-4</VerticalResolution>
            </Print>
            <PageLayoutZoom>0</PageLayoutZoom>
            <Selected/>
            <Panes>
                <Pane>
                    <Number>3</Number>
                    <ActiveRow>7</ActiveRow>
                    <ActiveCol>3</ActiveCol>
                </Pane>
            </Panes>
            <ProtectObjects>False</ProtectObjects>
            <ProtectScenarios>False</ProtectScenarios>
        </WorksheetOptions>
    </Worksheet>
</Workbook>
EOS;

    static $contactTemplate = <<<EOS
<Row ss:AutoFitHeight="0">
    <Cell ss:Index="2" ss:StyleID="s74"><Data ss:Type="String">{{name}}</Data></Cell>
    <Cell ss:StyleID="s74"><Data ss:Type="String">{{address1}}</Data></Cell>
    <Cell ss:StyleID="s74"><Data ss:Type="String">{{address2}}</Data></Cell>
    <Cell ss:StyleID="s74"><Data ss:Type="String">{{address3}}</Data></Cell>
    <Cell ss:StyleID="s74"><Data ss:Type="String">{{contact_name}}</Data></Cell>
    <Cell ss:StyleID="s74"><Data ss:Type="String">{{contact_email}}</Data></Cell>
    <Cell ss:StyleID="s78"><Data ss:Type="Number">{{org_num}}</Data></Cell>
    <Cell ss:StyleID="s78"><Data ss:Type="Number">{{contact_phone}}</Data></Cell>
</Row>
EOS;

    static $creditTemplate = <<<EOS
<Row ss:AutoFitHeight="0">
    <Cell ss:Index="2" ss:StyleID="s74"><Data ss:Type="String">{{ref_email}}</Data></Cell>
    <Cell ss:StyleID="s78"><Data ss:Type="String">{{ref_num}}</Data></Cell>
    <Cell ss:StyleID="s78"><Data ss:Type="String">{{ref_banknum}}</Data></Cell>
    <Cell ss:StyleID="s78"><Data ss:Type="String">{{ref_credit}}</Data></Cell>
    <Cell ss:StyleID="s74"><Data ss:Type="String">{{ref_comment}}</Data></Cell>
</Row>
EOS;

    static $productHeader = <<<EOS
<Row ss:Index="{{rowIndex}}" ss:AutoFitHeight="0" ss:StyleID="s66">
    <Cell ss:StyleID="s69"><Data ss:Type="String">Product {{id}}</Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="String">DEFA product number</Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="String">Mounted in vehicle</Data></Cell>
    <Cell ss:StyleID="s68"><Data ss:Type="String">Date of sale</Data></Cell>
    <Cell ss:StyleID="s68"><Data ss:Type="String">Car Make</Data></Cell>
    <Cell ss:StyleID="s68"><Data ss:Type="String">Year</Data></Cell>
    <Cell ss:StyleID="s68"><Data ss:Type="String">Type</Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="String">Number plate</Data></Cell>
    <Cell ss:StyleID="s68"><Data ss:Type="String">Name of owner</Data></Cell>
    <Cell ss:StyleID="s68"><Data ss:Type="String">Mounted by</Data></Cell>
    <Cell ss:StyleID="s67"><Data ss:Type="String">Comments</Data></Cell>
</Row>
EOS;

    static $productTemplate = <<<EOS
<Row ss:AutoFitHeight="0">
    <Cell ss:Index="2"><Data ss:Type="String">{{defa_number}}</Data></Cell>
    <Cell ss:StyleID="s74"><Data ss:Type="String">{{replacement}}</Data></Cell>
    <Cell ss:StyleID="s74"><Data ss:Type="String">{{sale_date}}</Data></Cell>
    <Cell ss:StyleID="s74"><Data ss:Type="String">{{manufacturer}}</Data></Cell>
    <Cell ss:StyleID="s74"><Data ss:Type="String">{{year}}</Data></Cell>
    <Cell ss:StyleID="s74"><Data ss:Type="String">{{type}}</Data></Cell>
    <Cell ss:StyleID="s74"><Data ss:Type="String">{{number}}</Data></Cell>
    <Cell ss:StyleID="s74"><Data ss:Type="String">{{owner}}</Data></Cell>
    <Cell ss:StyleID="s74"><Data ss:Type="String">{{mounted_by}}</Data></Cell>
    <Cell ss:StyleID="s74"><Data ss:Type="String">{{comment}}</Data></Cell>
</Row>
EOS;


    static public function getXml($data) {
        $contactData = str_replace(
            array('{{name}}', '{{address1}}', '{{address2}}', '{{address3}}', '{{contact_name}}', '{{contact_email}}',
                '{{org_num}}', '{{contact_phone}}'),
            array($data['name'], $data['address1'], $data['address2'], $data['address3'], $data['contact_name'],
                $data['contact_email'], $data['org_num'], $data['contact_phone']),
            self::$contactTemplate
        );

        $data['ref_shipping_comp'] = $data['ref_shipping_comp'] == 'on'?'Yes':'No';
        $data['ref_banknum'] = isset($data['ref_banknum'])?$data['ref_banknum']:'';
        $data['ref_comment'] = isset($data['ref_comment'])?$data['ref_comment']:'';
        $creditData = str_replace(
            array('{{ref_email}}', '{{ref_num}}', '{{ref_banknum}}', '{{ref_credit}}', '{{ref_comment}}'),
            array($data['ref_email'], $data['ref_num'], $data['ref_banknum'], $data['ref_shipping_comp'], $data['ref_comment']),
            self::$creditTemplate
        );

        $productData = '';
        $i = 1;
        $rowInd = 7;
        foreach ($data['product'] as $product) {
            $product['replacement'] = isset($product['replacement'])?'YES':'NO';
            $product['manufacturer'] =  isset($product['manufacturer'])?$product['manufacturer']:'';
            $product['year'] = isset($product['year'])?$product['year']:'';
            $product['type'] = isset($product['type'])?$product['type']:'';
            $product['number'] = isset($product['number'])?$product['number']:'';
            $product['mounted_by'] = isset($product['mounted_by'])?$product['mounted_by']:'';

            $productData.= str_replace(array('{{id}}', '{{rowIndex}}'), array($i, $rowInd), self::$productHeader) . str_replace(
                    array('{{defa_number}}',  '{{replacement}}', '{{sale_date}}', '{{manufacturer}}', '{{year}}', '{{type}}', '{{number}}',
                        '{{owner}}', '{{mounted_by}}', '{{comment}}'),
                    array($product['defa_number'], $product['replacement'], $product['sale_date'], $product['manufacturer'], $product['year'], $product['type'],
                        $product['number'], $product['owner'], $product['mounted_by'], $product['comment']),
                    self::$productTemplate
                );
            $i++;
            $rowInd += 3;
        }


//        return self::$template;
        return str_replace(array('{{contactTemplate}}', '{{creditTemplate}}', '{{productData}}'),
            array($contactData, $creditData, $productData),
            self::$template);
    }
}


class Model {
    static $conn;

    static public function initConnection() {
        if (!self::$conn) {
            self::$conn=new PDO("mysql:host=" . DB_SERVER . ";dbname=" . DB_NAME . ";",DB_USER,DB_PASSWORD);
//            self::$conn =  mysql_connect(DB_SERVER, DB_USER, DB_PASSWORD);
            if (!self::$conn) {
                return false;
            }
//            mysql_select_db(DB_NAME);
        }
        return true;
    }

    static public function lockContacts() {
        if (!self::initConnection()) {
            return array();
        }
        $q=self::$conn->prepare('LOCK TABLE contacts WRITE, products WRITE');
        $q->execute();

    }

    static public function unlockContacts() {
        if (!self::initConnection()) {
            return array();
        }
        $q=self::$conn->prepare('UNLOCK TABLES;');
        $q->execute();

    }

    static public function getNextId() {
        if (!self::initConnection()) {
            return array();
        }
        $q=self::$conn->prepare('SELECT COUNT(*) as "count" FROM  `contacts` WHERE `country_prefix`= "' . COUNTRY_PREFIX . '"');
        $q->execute();
        $res = $q->fetch(PDO::FETCH_ASSOC);
        return $res['count'] + 1;
    }

    static public function loadFromDb($contactNumber) {
        self::initConnection();
        $number = (int)substr($contactNumber, 1) - 1000;
        $q=self::$conn->prepare("SELECT * FROM `contacts` WHERE `contact_id`= ? AND `country_prefix`= ? LIMIT 0, 1");
        $q->execute(array($number, COUNTRY_PREFIX));
        $res = $q->fetch(PDO::FETCH_ASSOC);
        $sqlStr = mysql_query('SELECT * FROM `contacts` WHERE `contact_id`= ' . $number . ' AND `country_prefix`= "' . COUNTRY_PREFIX . '" LIMIT 0, 1');
        if(!empty($res)) {
            $q=self::$conn->prepare("SELECT * FROM `products` WHERE `contact_id`= ?");
            $q->execute(array($res['id']));
            $res['product'] = $q->fetchAll(PDO::FETCH_ASSOC);
        }
        return $res;
    }

    static public function saveData($contactId, $data) {
        if(!self::initConnection()) {
            return false;
        }
        if (!isset($data['ref_shipping_comp'])) {
            $data['ref_shipping_comp'] = 'off';
        }
        $contacts_data = array(
            'country_prefix' => COUNTRY_PREFIX,
            'contact_id' => $contactId,
            'name' => $data['name'],
            'address1' => $data['address1'],
            'address2' => $data['address2'],
            'address3' => $data['address3'],
            'org_num' => $data['org_num'],
            'contact_name' => $data['contact_name'],
            'contact_email' => $data['contact_email'],
            'contact_phone' => $data['contact_phone'],
            'refund' => isset($data['refund'])?1:0,
            'ref_email' => $data['ref_email'],
            'ref_num' => $data['ref_num'],
            'ref_banknum' => isset($data['ref_banknum']) && $data['ref_banknum']?$data['ref_banknum']:'',
            'ref_shipping_comp' => $data['ref_shipping_comp'],
            'ref_comment' => isset($data['ref_comment'])?$data['ref_comment']:'',
            'date_created' => date('Y-m-d h:i:s')
        );
        $strSQL = "INSERT INTO " . DB_NAME . "." . "contacts (" . implode(array_keys($contacts_data), ", ") . ") VALUES (:" . implode(array_keys($contacts_data), ", :") . ");";
        try{
            $q=self::$conn->prepare($strSQL);
            $q->execute($contacts_data);
        } catch(PDOException $e){
            print_r($e->getMessage());
        }
        $parentId = self::$conn->lastInsertId();
        if ($parentId) {
            foreach ($data['product'] as $product) {
                if (!empty($product['defa_number'])) {
                    $products_data = array(
                        'contact_id' => $parentId,
                        'defa_number' => isset($product['defa_number'])?$product['defa_number']:'',
                        'replacement' => isset($product['replacement'])?1:0,
                        'sale_date' => date('Y-m-d', strtotime($product['sale_date'])),
                        'manufacturer' => isset($product['manufacturer'])?$product['manufacturer']:'',
                        'year' => isset($product['year'])?$product['year']:'',
                        'type' => isset($product['type'])?$product['type']:'',
                        'number' => isset($product['number'])?$product['number']:'',
                        'owner' => $product['owner'],
                        'mounted_by' => isset($product['mounted_by'])?$product['mounted_by']:'',
                        'comment' => $product['comment'],
                        'date_created' => date('Y-m-d h:i:s')
                    );
                }
                $productSql = "INSERT INTO " . DB_NAME . "." . "products (" . implode(array_keys($products_data), ", ") . ") VALUES (:" . implode(array_keys($products_data), ", :") . ");";
                try{
                    $q=self::$conn->prepare($productSql);
                    $q->execute($products_data);
                } catch(PDOException $e){
                    print_r($e->getMessage());
                }
            }
            return true;
        }
        return false;
    }
}

function sendEmail($to, $contactId, $filename) {
    $subject = $contactId;
    switch(CURRENT_LANGUAGE) {
        case 'no':
            $subject = 'Returskjema ' . $contactId;
            break;
        case 'sv':
            $subject = 'Reklamationsformulär ' . $contactId;
            break;
        case 'fi':
            $subject = 'Palautuslomake ' . $contactId;
    }

    require PHPMAILER_DIR . 'PHPMailerAutoload.php';
    $file = dirname(__FILE__) . DIRECTORY_SEPARATOR . 'tmp' . DIRECTORY_SEPARATOR . $filename;
    $scriptPath = str_replace('preview.php', '', $_SERVER['SCRIPT_NAME']);

    $mail = new PHPMailer;
    $mail->CharSet = 'UTF-8';
    if (IS_SMTP) {
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Port = SMTP_PORT;
        $mail->Username = SMTP_USER;
        $mail->Password = SMTP_PASSWORD;
    }

    $mail->From = 'support@defa.com';
    $mail->FromName = 'Defa';
    $mail->addAddress(SUPPORT_EMAIL);  // Add a recipient

    global $emailsBcc;
    foreach($emailsBcc as $address) {
        $mail->addBCC($address);
    }


    $mail->addAttachment($file);
    $mail->Subject = $subject;
    $mail->Body    = 'XML is attached. To view request visit "' . PREVIEW_URL . '?contact_id=' . $contactId . '"';
    if(!$mail->send()) {
        echo 'Message could not be sent.';
        echo 'Mailer Error: ' . $mail->ErrorInfo;
        exit;
    }

    $mail = new PHPMailer;
    $mail->CharSet = 'UTF-8';
    if (IS_SMTP) {
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Port = SMTP_PORT;
        $mail->Username = SMTP_USER;
        $mail->Password = SMTP_PASSWORD;
    }

    $mail->From = 'support@defa.com';
    $mail->FromName = 'Defa';
    $mail->addAddress($to);  // Add a recipient

    foreach($emailsBcc as $address) {
        $mail->addBCC($address);
    }
    $mail->Subject = $subject;
    $mail->Body    = 'To view request visit "' . PREVIEW_URL . '?contact_id=' . $contactId . '"';
    if(!$mail->send()) {
        echo 'Message could not be sent.';
        echo 'Mailer Error: ' . $mail->ErrorInfo;
        exit;
    }
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
