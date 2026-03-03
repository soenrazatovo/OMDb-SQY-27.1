// TODO : .env to store key
const apikey = "5fe29907"

const movieGrid = document.querySelector(".movie-grid")

const searchInput = document.querySelector(".search-input")
const searchSubmit = document.querySelector(".search-submit")

const navBar = document.querySelector(".navbar")
const currentPage = document.querySelector(".current")
const firstPage = document.querySelector(".first-page")
const previousPage = document.querySelector(".previous-page")
const nextPage = document.querySelector(".next-page")
const lastPage = document.querySelector(".last-page")

let movieName = ""
let current = 1

let favorites = JSON.parse(localStorage.getItem("favorites")) || []

async function searchMovie(name,page=1){
    console.log("http://www.omdbapi.com/?apikey="+apikey+"&s="+name+"&page="+page)
    const res = await fetch("http://www.omdbapi.com/?apikey="+apikey+"&s="+name+"&page="+page,{headers : {"Accept":"application/json"}})
    const data = await res.json()
    movieName = name
    current = page

    console.log(data)
    if(data.Response == "False"){
        alert(data.Error)
    } else {
        lastPage.textContent = Math.round(data.totalResults / 10)
        currentPage.textContent = current

        navBar.style.display = "flex"


        movieGrid.innerHTML = ""
        await data.Search.forEach(movie => {createMovieCell(movie)})
    }
}

function createMovieCell(movie){
    // console.log(movie)
    const div = document.createElement("div")
    div.classList = "movie-cell"

    console.log(favorites)
    console.log(movie)
    console.log(favorites.includes(movie))

    div.innerHTML = `
    <img src="${movie.Poster}" alt="poster">
    <div class="movie-footer">
        <div class="movie-info">
            <h1>${movie.Title}</h1>
            <h3>${movie.Type}</h3>
            <h3>Date of released : ${movie.Year}</h3>
        </div>
        <div class="movie-actions">
            <button class="fav-btn${favorites.includes(movie) ? "pressed" : ""}" aria-pressed="false" title="Add to favorites">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke="currentColor" stroke-width="1"/>
                </svg>
            </button>
            <button class="more-btn">More ...</button>
        </div>
    </div>`

    movieGrid.appendChild(div)

    const fav = div.querySelector('.fav-btn')
    fav.addEventListener('click', () => {
        fav.classList.toggle("pressed")

        if (fav.classList.contains("pressed")){
            console.log("Added")
            favorites.push(movie)
        } else {
            console.log("Removed")
            favorites = favorites.filter((favMovie)=>{favMovie != movie})
        }

        localStorage.setItem("favorites",JSON.stringify(favorites))
    })
}

firstPage.addEventListener("click",()=>{
    searchMovie(movieName,1)
})

previousPage.addEventListener("click",()=>{
    if (current>1){
        searchMovie(movieName,current-1)
    }
})

nextPage.addEventListener("click",()=>{
    if (current<lastPage.textContent){
        searchMovie(movieName,current+1)
    }
})

lastPage.addEventListener("click",()=>{
    searchMovie(movieName,lastPage.textContent)
})

searchSubmit.addEventListener("click",()=>{
    if(searchInput.value == ""){
        alert("Please enter a movie name")
    } else {
        searchMovie(searchInput.value)
    }
})