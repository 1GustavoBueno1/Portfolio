const titulo = document.querySelector(".botao");
const fundo = document.body;
let ligado_escuro = false;
fundo.addEventListener("click", function(){
    if (ligado_escuro === false){
        titulo.textContent = "Modo Escuro";
        fundo.style.background = "black";

        ligado_escuro = true
    } else {
        titulo.textContent = "Modo claro";
        fundo.style.background = "#0d1b2a";
        ligado_escuro = false;
    };
});
