<?php
$host     = "localhost";
$user     = "root";
$password = "root";
$database = "Troglos";

$connexion = mysqli_connect($host, $user, $password, $database);

if (!$connexion) {
  die("Erreur de connexion : " . mysqli_connect_error());
}

$sql      = "SELECT * FROM notes_de_frais ORDER BY date_envoi DESC";
$resultat = mysqli_query($connexion, $sql);
?>

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Historique — Troglos</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <header>
    <h1>Historique des notes de frais</h1>
    <p>Clan Spéléo des Troglodytes · Lyon</p>
  </header>

  <main>

    <?php if (isset($_GET['message']) && $_GET['message'] == 'ok'): ?>
      <div class="message-ok">Note de frais enregistrée avec succès !</div>
    <?php endif; ?>

    <a href="index.html" class="lien-historique">← Nouvelle note de frais</a>

    <div class="bloc">
      <?php if (mysqli_num_rows($resultat) == 0): ?>
        <p>Aucune note de frais enregistrée pour l'instant.</p>

      <?php else: ?>
        <table class="tableau-historique">
          <thead>
            <tr>
              <th>Date</th>
              <th>Nom</th>
              <th>Raison</th>
              <th>Budget</th>
              <th>Km</th>
              <th>Péages</th>
              <th>Autres</th>
              <th>Total</th>
              <th>Mode</th>
            </tr>
          </thead>
          <tbody>
            <?php while ($note = mysqli_fetch_assoc($resultat)): ?>
              <tr>
                <td><?= $note['date_envoi'] ?></td>
                <td><?= $note['nom'] ?></td>
                <td><?= $note['raison'] ?></td>
                <td><?= $note['budget'] ?></td>
                <td><?= $note['km'] ?> km</td>
                <td><?= $note['peage'] ?> €</td>
                <td><?= $note['autres'] ?> €</td>
                <td><strong><?= $note['total'] ?> €</strong></td>
                <td><?= $note['mode'] ?></td>
              </tr>
            <?php endwhile; ?>
          </tbody>
        </table>
      <?php endif; ?>
    </div>

  </main>

</body>
</html>

<?php mysqli_close($connexion); ?>