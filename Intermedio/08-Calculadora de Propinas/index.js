function calculateTip() {
  const billAmount = parseFloat(document.getElementById("billAmount").value);
  const numPeople = parseInt(document.getElementById("numPeople").value);
  const roundOption = document.getElementById("roundOption").value;

  // Obtener porcentaje de propina
  let tipPercentage;
  if (document.getElementById("customTipCheck").checked) {
    tipPercentage = parseFloat(document.getElementById("customTip").value);
  } else {
    tipPercentage = parseFloat(document.getElementById("tipPercentage").value);
  }

  // Calcular la propina
  const tipAmount = (billAmount * tipPercentage) / 100;
  let totalAmount = billAmount + tipAmount;
  let totalPerPerson = totalAmount / numPeople;

  // Aplicar redondeo si es necesario
  if (roundOption === "top") {
    tipAmount = Math.ceil(tipAmount);
    totalAmount = billAmount + tipAmount;
    totalPerPerson = totalAmount / numPeople;
  } else if (roundOption === "down") {
    tipAmount = Math.floor(totalAmount);
    totalAmount = billAmount + tipAmount;
    totalPerPerson = totalAmount / numPeople;
  }

  // Mostrar resultados
  document.getElementById("tipAmount").value = tipAmount.toFixed(2);
  document.getElementById("totalAmount").value = totalAmount.toFixed(2);
  document.getElementById("totalPerPerson").value = totalPerPerson.toFixed(2);
}

function resetCalculator() {
  document.getElementById("billAmount").value = "";
  document.getElementById("tipPercentage").value = "10";
  document.getElementById("customTipCheck").checked = false;
  document.getElementById("customTip").value = "";
  document.getElementById("customTip").disabled = true;
  document.getElementById("numPeople").value = "1";
  document.getElementById("roundOption").value = "none";
  document.getElementById("tipAmount").value = "";
  document.getElementById("totalAmount").value = "";
  document.getElementById("totalPerPerson").value = "";
}

document
  .getElementById("customTipCheck")
  .addEventListener("change", function () {
    document.getElementById("customTip").disabled = !this.checked;
  });

function sendEmail() {
  alert("Funcionalidad de enviar por correo no implementada.");
  // Usar API EMAILJS o desarrollar BackEnd.
}

function printPage() {
  window.print();
}
