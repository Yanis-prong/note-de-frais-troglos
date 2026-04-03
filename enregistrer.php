<?php
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'PHPMailer/src/Exception.php';
require 'fpdf/fpdf.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$host     = "localhost";
$user     = "root";
$password = "root";
$database = "Troglos";

$connexion = mysqli_connect($host, $user, $password, $database);
if (!$connexion) {
  die("Erreur de connexion : " . mysqli_connect_error());
}

$nom          = $_POST['nom'];
$date_demande = $_POST['date_demande'];
$raison       = $_POST['raison'];
$budget       = $_POST['budget'];
$km           = $_POST['km'];
$peage        = $_POST['peage'];
$autres       = $_POST['autres'];
$total        = $_POST['total'];
$mode         = $_POST['mode'];
$iban         = $_POST['iban'] ?? '';
$abandon      = $_POST['abandon_montant'] ?? '';
$signature    = $_POST['signature'] ?? '';

$sql = "INSERT INTO notes_de_frais 
        (nom, date_demande, raison, budget, km, peage, autres, total, mode, iban, date_envoi)
        VALUES 
        ('$nom', '$date_demande', '$raison', '$budget', '$km', '$peage', '$autres', '$total', '$mode', '$iban', NOW())";

mysqli_query($connexion, $sql);
mysqli_close($connexion);

$pdf = new FPDF();
$pdf->AddPage();
$pdf->SetFillColor(44, 44, 44);
$pdf->Rect(0, 0, 210, 25, 'F');
$pdf->SetFont('Arial', 'B', 16);
$pdf->SetTextColor(255, 255, 255);
$pdf->SetY(8);
$pdf->Cell(0, 10, 'NOTE DE FRAIS - Clan Speleo des Troglodytes', 0, 1, 'C');
$pdf->SetTextColor(0, 0, 0);
$pdf->Ln(10);

function afficherChamp($pdf, $label, $valeur) {
  $pdf->SetFont('Arial', 'B', 9);
  $pdf->SetTextColor(120, 120, 120);
  $pdf->Cell(0, 5, $label, 0, 1);
  $pdf->SetFont('Arial', '', 11);
  $pdf->SetTextColor(0, 0, 0);
  $pdf->Cell(0, 7, $valeur, 0, 1);
  $pdf->Ln(2);
}

function titreSection($pdf, $titre) {
  $pdf->SetFont('Arial', 'B', 11);
  $pdf->SetTextColor(192, 82, 42);
  $pdf->Cell(0, 8, $titre, 0, 1);
  $pdf->SetDrawColor(192, 82, 42);
  $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());
  $pdf->Ln(4);
}

titreSection($pdf, 'IDENTIFICATION');
afficherChamp($pdf, 'Nom du demandeur', $nom);
afficherChamp($pdf, 'Date de la demande', $date_demande);
afficherChamp($pdf, 'Raison de la depense', $raison);
afficherChamp($pdf, 'Budget', $budget);

titreSection($pdf, 'DEPENSES');
afficherChamp($pdf, 'Kilometres', $km . ' km');
afficherChamp($pdf, 'Peages / Transports', $peage . ' EUR');
afficherChamp($pdf, 'Autres depenses', $autres . ' EUR');
afficherChamp($pdf, 'TOTAL', $total . ' EUR');

titreSection($pdf, 'REGLEMENT');
afficherChamp($pdf, 'Mode de reglement', $mode);
if ($mode == 'remboursement') {
  afficherChamp($pdf, 'IBAN', $iban);
} else {
  afficherChamp($pdf, 'Montant abandonne', $abandon . ' EUR');
}

titreSection($pdf, 'SIGNATURE');
if (!empty($signature)) {
  $sig_data = str_replace('data:image/png;base64,', '', $signature);
  $sig_data = base64_decode($sig_data);
  $sig_file = tempnam(sys_get_temp_dir(), 'sig_') . '.png';
  file_put_contents($sig_file, $sig_data);
  $pdf->Image($sig_file, 10, $pdf->GetY(), 100, 30);
  unlink($sig_file);
  $pdf->Ln(35);
} else {
  $pdf->SetDrawColor(200, 200, 200);
  $pdf->Rect(10, $pdf->GetY(), 190, 30);
  $pdf->Ln(35);
}

$pdf->SetY(-20);
$pdf->SetFont('Arial', 'I', 8);
$pdf->SetTextColor(150, 150, 150);
$pdf->Cell(0, 10, 'Formulaire a envoyer avec justificatifs a tresorier@troglos.fr', 0, 0, 'C');
$pdf_file = tempnam(sys_get_temp_dir(), 'NDF_') . '.pdf';
$pdf->Output('F', $pdf_file);

$mail = new PHPMailer(true);

try {
  $mail->isSMTP();
  $mail->Host       = 'smtp.gmail.com';
  $mail->SMTPAuth   = true;
  $mail->Username   = GMAIL_USER;
  $mail->Password   = GMAIL_PASSWORD;
  $mail->SMTPSecure = 'tls';
  $mail->Port       = 587;
  $mail->CharSet    = 'UTF-8';
  $mail->setFrom(GMAIL_USER, 'Note de Frais Troglos');
  $mail->addAddress('yanis.rekik180304@gmail.com');
  $mail->addCC(GMAIL_USER);
  $mail->Subject = 'Note de Frais - ' . $nom . ' - ' . $date_demande;
  $mail->Body    = "Bonjour,\n\nVeuillez trouver ci-joint la note de frais de $nom.\n\nTotal : $total EUR\nMode : $mode\n\nCordialement,\n$nom";
  $mail->addAttachment($pdf_file, 'Note_de_frais_' . $nom . '_' . $date_demande . '.pdf');
  $mail->send();
  unlink($pdf_file);

  header("Location: historique.php?message=ok");

} catch (Exception $e) {
  echo "Erreur envoi mail : " . $mail->ErrorInfo;
}
?>