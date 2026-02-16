const selectCategorias = document.querySelector("#categorias")
const resultado = document.querySelector("#resultado")
const modal = new bootstrap.Modal("#modal", {})
const favoritosDIV = document.querySelector(".favoritos")

const limmpiarHTML = (referencia) => {
    while (referencia.firstChild) {
        referencia.removeChild((referencia.firstChild))
    }
}

const obtenerFavoritos = (favoritos) => {
    favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
    if (favoritos.length) {
        renderizarRecetasCategoria(favoritos)
        return
    }

    const noFavoritos = document.createElement("P")
    noFavoritos.textContent = "No hay favoritos aun"
    noFavoritos.classList.add("fs-4", "text-center", "font-bold", "mt-5")
    resultado.appendChild(noFavoritos)
}

const mostrarToast = (mensaje) => {
    const toastDIV = document.querySelector("#toast")
    const toastBody = document.querySelector(".toast-body")
    const toast = new bootstrap.Toast(toastDIV)
    toastBody.textContent = mensaje
    toast.show()
}

const eliminarFavorito = (id) => {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
    const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id)
    localStorage.setItem("favoritos", JSON.stringify(nuevosFavoritos))
}

const existeStorage = (id) => {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
    return favoritos.some(favorito => favorito.id === id)
}

const agregarFavorito = (receta) => {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
    localStorage.setItem("favoritos", JSON.stringify([...favoritos, receta]))
}

const mostrarRecetaModal = (receta) => {
    const { idMeal, strInstructions, strMeal, strMealThumb } = receta

    const modalTitle = document.querySelector(".modal .modal-title")
    modalTitle.textContent = strMeal
    const modalBody = document.querySelector(".modal .modal-body")
    modalBody.innerHTML = `
        <img class="img-fluid" src=${strMealThumb} alt=${strMeal} />
        <h3 class="my-3">Instrucciones</h3>
        <p>${strInstructions}</p>
        <h3 class="my-3">Ingredientes y cantidades</h3>
    `

    const listGroup = document.createElement("UL")
    listGroup.classList.add("list-group")

    //Mapeo de ingredientes y cantidades
    for (let i = 1; i <= 20; i++) {
        if (receta[`strIngredient${i}`]) {
            const ingrediente = receta[`strIngredient${i}`]
            const cantidad = receta[`strMeasure${i}`]

            const ingredienteLI = document.createElement("LI")
            ingredienteLI.classList.add("list-group-item")
            ingredienteLI.textContent = `${ingrediente} - ${cantidad}`

            listGroup.appendChild(ingredienteLI)
        }
    }

    modalBody.appendChild(listGroup)

    const btnFavorito = document.createElement("BUTTON")
    btnFavorito.classList.add("btn", "btn-danger", "col")
    btnFavorito.textContent = existeStorage(idMeal) ? "Eliminar Favorito" : "Guardar Favorito";
    btnFavorito.onclick = () => {

        if (existeStorage(idMeal)) {
            eliminarFavorito(idMeal)
            btnFavorito.textContent = "Guardar Favorito"
            mostrarToast("Eliminado Correctamente")
            return
        }

        agregarFavorito({
            id: idMeal,
            title: strMeal,
            img: strMealThumb
        })
        btnFavorito.textContent = "Eliminar Favorito"
        mostrarToast("Agregado correctamente")
    }

    const btnCerrar = document.createElement("BUTTON")
    btnCerrar.classList.add("btn", "btn-secondary", "col")
    btnCerrar.textContent = "Cerrar"

    btnCerrar.onclick = () => {
        //Se ve en el prototype
        modal.hide()
    }

    const modalFooter = document.querySelector(".modal-footer")
    limmpiarHTML(modalFooter)
    modalFooter.appendChild(btnFavorito)
    modalFooter.appendChild(btnCerrar)


    modal.show()
}

const seleccionarReceta = async (id) => {
    const URL = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    const response = await fetch(URL)
    const data = await response.json()
    mostrarRecetaModal(data.meals[0]);
}

const renderizarRecetasCategoria = (recetas = []) => {

    limmpiarHTML(resultado)

    const heading = document.createElement("H2")
    heading.classList.add("text-center", "text-black", "my-5")
    heading.textContent = recetas.length ? "Resultados" : "No Hay Resultados";
    resultado.appendChild(heading)


    recetas.forEach(receta => {
        const { idMeal, strMeal, strMealThumb } = receta

        const recetaContenedor = document.createElement("DIV")
        recetaContenedor.classList.add("col-md-4")

        const recetaCard = document.createElement("DIV")
        recetaCard.classList.add("card", "mb-4")

        const recetaImagen = document.createElement("IMG")
        recetaImagen.classList.add("card-img-top")
        recetaImagen.alt = `Imagen ed la receta ${strMeal ?? receta.title}`
        recetaImagen.src = strMealThumb ?? receta.img

        const recetaCardBody = document.createElement("DIV")
        recetaCardBody.classList.add("card-body")

        const recetaHeading = document.createElement("H3")
        recetaHeading.classList.add("card-title", "mb-3")
        recetaHeading.textContent = strMeal ?? receta.title

        const recetaButton = document.createElement("BUTTON")
        recetaButton.classList.add("btn", "btn-danger", "w-100")
        recetaButton.textContent = "Ver Receta"
        // recetaButton.dataset.bsTarget = "#modal"
        // recetaButton.dataset.bsToggle = "modal"
        //Con el callback se espera a el desarrollo del evento
        recetaButton.onclick = () => {
            seleccionarReceta(idMeal ?? receta.id)
        }

        recetaCardBody.appendChild(recetaHeading)
        recetaCardBody.appendChild(recetaButton)
        recetaCard.appendChild(recetaImagen)
        recetaCard.appendChild(recetaCardBody)
        recetaContenedor.appendChild(recetaCard)

        resultado.appendChild(recetaContenedor)
    })
}

const seleccionarCategoria = async (e) => {
    const categoria = e.target.value
    const URL = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`
    const response = await fetch(URL)
    const data = await response.json()
    renderizarRecetasCategoria(data.meals)
}

const renderizarOpcionesCategorias = (categories = []) => {
    categories.forEach(categorie => {
        const { strCategory } = categorie

        const option = document.createElement("OPTION")
        option.value = strCategory
        option.textContent = strCategory

        selectCategorias.appendChild(option)
    })
}

const obtenerCategoriasAPI = async () => {
    URI = "https://www.themealdb.com/api/json/v1/1/categories.php";

    const response = await fetch(URI)
    const data = await response.json()
    renderizarOpcionesCategorias(data.categories)
}

document.addEventListener("DOMContentLoaded", () => {
    if (selectCategorias) {
        selectCategorias.addEventListener("change", seleccionarCategoria)
        obtenerCategoriasAPI()
    }
    if (favoritosDIV) {
        obtenerFavoritos()
    }
})