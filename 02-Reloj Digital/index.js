let mostrarReloj=()=>{
    let reloj=document.getElementById('reloj');
    let fec_Datos=document.getElementById('fec_Datos');
    let fecha=new Date();
    let hora=fecha.getHours();
    let minutos=fecha.getMinutes();
    let segundos=fecha.getSeconds();
    let mes=fecha.getMonth();
    let dia=fecha.getDate();
    let anio=fecha.getFullYear();
    
    let dias=['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
    let meses=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    
    mes=meses[mes]
    let hr=(hora>12) ? hora-12 : hora;
    let am=(hora<12) ? 'AM' : 'PM';
    if(hora<10){hora='0'+hora}
    if(minutos<10){minutos='0'+minutos}
    if(segundos<10){segundos='0'+segundos}

    reloj.textContent=`${hr}:${minutos}:${segundos} ${am}`;
    fec_Datos.textContent=`${dia} ${mes} del ${anio}`;
}

setInterval(mostrarReloj,1000)