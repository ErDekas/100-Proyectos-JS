document.addEventListener('DOMContentLoaded', function() {
    const tree = document.querySelector('.tree');

    let angle = 0;
    let swingDirection = 1; // 1 para adelante, -1 para atrás
    const maxAngle = 15; // Ángulo máximo de balanceo
    let verticalDirection = 1; // 1 para arriba, -1 para abajo
    const maxVerticalShift = 20; // Máximo desplazamiento vertical

    function swingTree() {
        angle += 1 * swingDirection;
        if (angle > maxAngle || angle < -maxAngle) {
            swingDirection *= -1; // Cambiar dirección cuando se alcanza el ángulo máximo
        }

        const verticalShift = Math.sin(angle * Math.PI / 180) * maxVerticalShift;
        tree.style.transform = `rotate(${angle}deg) translateY(${verticalShift}px)`;
        requestAnimationFrame(swingTree);
    }

    swingTree();
});
