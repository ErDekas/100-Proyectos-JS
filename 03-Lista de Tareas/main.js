window.onload = ini;

function ini(){
    let nomas = false;
    let contador = 0;
    document.getElementById('ctrab').addEventListener('keyup',createTrab);
    function createTrab(e){
        if(e.which == 13){
            if(this.value !== ''){
                contador++;
            document.getElementById('numero').innerHTML=contador;
            let elementP = document.createElement('p');
            let textP = document.createTextNode(this.value);
            let iconsave = document.createElement('i');
            let iconremove = document.createElement('i');

            iconsave.className = 'fas fa-save';
            iconsave.setAttribute('title', 'Guardar tarea');
            iconremove.className = 'fas fa-trash-alt';
            iconremove.setAttribute('title','Remover tarea');
            
            elementP.appendChild(textP);
            elementP.appendChild(iconsave);
            elementP.appendChild(iconremove);

            document.getElementById('trabajos').appendChild(elementP);

            nomas = false;

            this.value = '';

            if(document.getElementsByClassName('errorUF').length > 0){
                document.getElementsByClassName('errorUF')[0].remove();
            }

            for(var i = 0; i < document.getElementById('trabajos').getElementsByTagName('p').length;i++){
                document.getElementById('jobs').getElementsByClassName('fa-trash-alt')[i].addEventListener('click',remover);
            }
            for(var i = 0; i < document.getElementById('jobs').getElementsByClassName('fas fa-save').length;i++){
                document.getElementById('jobs').getElementsByClassName('fas fa-save')[i].addEventListener('click',saveElement);
            }
             
            }else{

                let errorP = document.createElement('p');
                let textEP = document.createTextNode('Ingresa una tarea valida');
            
                errorP.className = 'errorUF';
                errorP.appendChild(textEP);
            
                if(nomas == false){
                document.getElementsByClassName('info')[0].appendChild(errorP);
                nomas = true;
                }
            }
        }
    }
    
    
    
    for(var i = 0;i < localStorage.length;i++){
    contador = localStorage.length;
    var itemsv = document.createElement('p');
        
    var itemtextnode = document.createTextNode(localStorage.key(i));
    
        let iconr = document.createElement('i');
            
        iconr.className = 'fas fa-trash-alt';
        iconr.setAttribute('title','Remover tarea');
            
        itemsv.appendChild(iconr);         
        
        itemsv.appendChild(itemtextnode);

        document.getElementById('jobs').appendChild(itemsv);
        document.getElementById('noas').innerHTML = document.getElementById('jobs').getElementsByTagName('p').length;
        document.getElementById('jobs').getElementsByClassName('fa-trash-alt')[i].addEventListener('click',remover);   
        
    }
    
     function saveElement(){
                var saveItem = this.parentElement.textContent;
                localStorage.setItem(saveItem,saveItem);
                
    }
    
    function remover(){
         contador--;
            document.getElementById('noas').innerHTML= contador;
            this.parentElement.remove();
        
        if(localStorage.length > 0){
            localStorage.removeItem(this.parentElement.textContent);
        }
    }
}