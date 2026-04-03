var BAREME_KM = 0.606;
var hasSig = false;

function switchTab(id, btn) {
  document.querySelectorAll('.tab-content').forEach(function(t) {
    t.classList.remove('active');
  });
  document.querySelectorAll('.tab').forEach(function(t) {
    t.classList.remove('active');
  });
  document.getElementById('tab-' + id).classList.add('active');
  btn.classList.add('active');
}

function calculerTotal() {
  var km     = parseFloat(document.getElementById('km').value)     || 0;
  var peage  = parseFloat(document.getElementById('peage').value)  || 0;
  var autres = parseFloat(document.getElementById('autres').value) || 0;
  var total  = (km * BAREME_KM) + peage + autres;

  document.getElementById('total_affiche').value = total.toFixed(2) + ' €';
  document.getElementById('total').value = total.toFixed(2);
}

document.getElementById('km').addEventListener('input', calculerTotal);
document.getElementById('peage').addEventListener('input', calculerTotal);
document.getElementById('autres').addEventListener('input', calculerTotal);

function afficherChampMode() {
  var mode = document.getElementById('mode').value;
  document.getElementById('champ-remboursement').style.display = mode === 'remboursement' ? 'block' : 'none';
  document.getElementById('champ-abandon').style.display       = mode === 'abandon'        ? 'block' : 'none';
}

function calculerAbandon() {
  var montant = parseFloat(document.getElementById('abandon-montant').value) || 0;
  var reel = montant * 0.34;
  document.getElementById('abandon-reel').value = reel.toFixed(2) + ' €';
}

var canvas  = document.getElementById('sig-canvas');
var ctx     = canvas.getContext('2d');
var drawing = false;

function resizeCanvas() {
  var w = canvas.offsetWidth;
  canvas.width  = w;
  canvas.height = 150;
  ctx.strokeStyle = '#000';
  ctx.lineWidth   = 2;
  ctx.lineCap     = 'round';
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function getPos(e) {
  var rect  = canvas.getBoundingClientRect();
  var touch = e.touches ? e.touches[0] : e;
  return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
}

canvas.addEventListener('mousedown', function(e) {
  drawing = true;
  var p = getPos(e);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
});
canvas.addEventListener('mousemove', function(e) {
  if (!drawing) return;
  var p = getPos(e);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  hasSig = true;
});
canvas.addEventListener('mouseup',    function() { drawing = false; });
canvas.addEventListener('mouseleave', function() { drawing = false; });

canvas.addEventListener('touchstart', function(e) {
  e.preventDefault();
  drawing = true;
  var p = getPos(e);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
});
canvas.addEventListener('touchmove', function(e) {
  e.preventDefault();
  if (!drawing) return;
  var p = getPos(e);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  hasSig = true;
});
canvas.addEventListener('touchend', function() { drawing = false; });

function clearSig() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hasSig = false;
  document.getElementById('signature').value = '';
}

document.getElementById('mon-formulaire').addEventListener('submit', function() {
  if (hasSig) {
    document.getElementById('signature').value = canvas.toDataURL('image/png');
  }
});

function genererPDF() {
  if (hasSig) {
    document.getElementById('signature').value = canvas.toDataURL('image/png');
  }

  var jsPDF = window.jspdf.jsPDF;
  var doc   = new jsPDF({ unit: 'mm', format: 'a4' });
  var W     = 210;
  var y     = 20;

  doc.setFillColor(44, 44, 44);
  doc.rect(0, 0, W, 30, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('NOTE DE FRAIS', 20, 19);
  doc.setFontSize(9);
  doc.setTextColor(170, 170, 170);
  doc.text('Clan Spéléo des Troglodytes · Lyon', W - 20, 19, { align: 'right' });
  y = 40;

  function ligne(label, valeur) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(valeur || '—', 20, y + 6);
    y += 14;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(192, 82, 42);
  doc.text('IDENTIFICATION', 20, y);
  y += 8;

  ligne('Nom du demandeur',  document.getElementById('nom').value);
  ligne('Date de la demande', document.getElementById('date_demande').value);
  ligne('Raison',            document.getElementById('raison').value);
  ligne('Budget',            document.getElementById('budget').value);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(192, 82, 42);
  doc.text('DÉPENSES', 20, y);
  y += 8;

  ligne('Kilomètres',         document.getElementById('km').value + ' km');
  ligne('Péages / Transports', document.getElementById('peage').value + ' €');
  ligne('Autres',             document.getElementById('autres').value + ' €');
  ligne('TOTAL',              document.getElementById('total_affiche').value);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(192, 82, 42);
  doc.text('RÈGLEMENT', 20, y);
  y += 8;

  var mode = document.getElementById('mode').value;
  ligne('Mode', mode === 'remboursement' ? 'Remboursement' : 'Abandon de frais');

  if (mode === 'remboursement') {
    ligne('IBAN', document.getElementById('iban').value);
  } else {
    ligne('Montant abandonné', document.getElementById('abandon-montant').value + ' €');
    ligne('Coût réel (après 66%)', document.getElementById('abandon-reel').value);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(192, 82, 42);
  doc.text('SIGNATURE', 20, y);
  y += 6;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  doc.rect(20, y, W - 40, 30);

  if (hasSig) {
    try {
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', 21, y + 1, W - 42, 28);
    } catch(e) {}
  }

  doc.setFillColor(44, 44, 44);
  doc.rect(0, 282, W, 15, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(170, 170, 170);
  doc.text('Formulaire à envoyer avec justificatifs à tresorier@troglos.fr', W / 2, 291, { align: 'center' });

  var nom  = document.getElementById('nom').value.replace(/\s+/g, '_') || 'demandeur';
  var date = document.getElementById('date_demande').value || 'date';
  doc.save('NDF_Troglos_' + nom + '_' + date + '.pdf');
}

function ouvrirModalMail() {
  document.getElementById('modal-mail').style.display = 'flex';
}

function fermerModalMail() {
  document.getElementById('modal-mail').style.display = 'none';
}

function envoyerMail() {
  var from  = document.getElementById('mail-expediteur').value;
  var to    = document.getElementById('mail-destinataire').value;
  var nom   = document.getElementById('nom').value || 'Demandeur';
  var date  = document.getElementById('date_demande').value || '';
  var total = document.getElementById('total_affiche').value || '0 €';

  genererPDF();

  var sujet = encodeURIComponent('Note de Frais - ' + nom + ' - ' + date);
  var corps = encodeURIComponent(
    'Bonjour,\n\nVeuillez trouver ci-joint la note de frais de ' + nom + '.\n\nTotal : ' + total + '\n\nCordialement,\n' + nom
  );

  window.open('mailto:' + to + '?cc=' + from + '&subject=' + sujet + '&body=' + corps);
  fermerModalMail();
}

document.getElementById('date_demande').value = new Date().toISOString().slice(0, 10);