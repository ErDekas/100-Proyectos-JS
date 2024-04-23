const boton = document.getElementById('boton');
const dice = document.getElementById('dice');
const puntos = dice.querySelectorAll('.punto');

boton.addEventListener('click', () => {
    
    const randomNumber = Math.floor(Math.random() * 6) + 1;

    puntos.forEach(punto => punto.style.display = 'none');

    switch (randomNumber) {
        case 1:
            puntos[4].style.display = 'block';
            break;
        case 2:
            puntos[3].style.display = 'block';
            puntos[5].style.display = 'block';
            break;
        case 3:
            puntos[0].style.display = 'block';
            puntos[4].style.display = 'block';
            puntos[8].style.display = 'block';
            break;
        case 4:
            puntos[0].style.display = 'block';
            puntos[2].style.display = 'block';
            puntos[6].style.display = 'block';
            puntos[8].style.display = 'block';
            break;
        case 5:
            puntos[0].style.display = 'block';
            puntos[2].style.display = 'block';
            puntos[4].style.display = 'block';
            puntos[6].style.display = 'block';
            puntos[8].style.display = 'block';
            break;
        case 6:
            puntos[0].style.display = 'block';
            puntos[1].style.display = 'block';
            puntos[2].style.display = 'block';
            puntos[6].style.display = 'block';
            puntos[7].style.display = 'block';
            puntos[8].style.display = 'block';
            break;
        default:
            break;
    }
    console.log(randomNumber);
});
document.addEventListener('DOMContentLoaded', function() {
    boton.addEventListener('click', function() {

      dice.classList.add('rollAnimation');
    
      setTimeout(function() {
        dice.classList.remove('rollAnimation');
      }, 2000);
    });
  });