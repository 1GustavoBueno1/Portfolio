console.log("script.js carregou!");
const elementos = document.querySelectorAll(".Animar");
const observador = new IntersectionObserver(function(entradas)
{
    entradas.forEach(function(entrada)
{   if (entrada.isIntersecting === true) {
        entrada.target.classList.add("Visivel")
        };

    });
});
elementos.forEach(function(elemento)
{
    observador.observe(elemento)
});
