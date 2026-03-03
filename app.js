// TODO : .env to store key
const apikey = "5fe29907"

const movieGrid = document.querySelector(".movie-grid")

const searchInput = document.querySelector(".search-input")
const searchSubmit = document.querySelector(".search-submit")
const showFavBtn = document.querySelector(".show-fav")

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

    var isPressed = false;
    favorites.forEach(favorite => {
        if (favorite["imdbID"] == movie["imdbID"]){
            isPressed = true
        }
    })
    console.log(isPressed)

    div.innerHTML = `
    <img src="${movie.Poster}" alt="poster">
    <div class="movie-footer">
        <div class="movie-info">
            <h1>${movie.Title}</h1>
            <h3>${movie.Type}</h3>
            <h3>Date of released : ${movie.Year}</h3>
        </div>
        <div class="movie-actions">
            <button class="fav-btn ${isPressed ? "pressed" : ""}" aria-pressed="false" title="Add to favorites">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke="currentColor" stroke-width="1"/>
                </svg>
            </button>
            <button class="more-btn">More ...</button>
        </div>
    </div>`

    movieGrid.appendChild(div)

    const fav = div.querySelector(".fav-btn")

    fav.addEventListener("click", () => {
        fav.classList.toggle("pressed")

        if (fav.classList.contains("pressed")){
            console.log("Added")
            favorites.push(movie)
        } else {
            console.log("Removed")
            favorites = favorites.filter((favorite)=> favorite["imdbID"] != movie["imdbID"])
        }

        localStorage.setItem("favorites",JSON.stringify(favorites))
    })


    const more = div.querySelector(".more-btn")

    more.addEventListener("click", () => {
        showInfo(movie)
    })
}

async function showInfo(movie){
    console.log("http://www.omdbapi.com/?apikey="+apikey+"&i="+movie.imdbID)
    const res = await fetch("http://www.omdbapi.com/?apikey="+apikey+"&i="+movie.imdbID,{headers : {"Accept":"application/json"}})
    const data = await res.json()
    
    console.log(JSON.stringify(data))

    if(data.Response == "False"){
        alert(data.Error)
    } else {
        showMovieModal(data)
    }
}

function showMovieModal(data){
    // remove existing modal if present
    const existing = document.querySelector('.modal-overlay')
    if(existing) existing.remove()

    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay'

    const modal = document.createElement('div')
    modal.className = 'modal-window'

    // header with title and close
    const header = document.createElement('div')
    header.className = 'modal-header'
    const title = document.createElement('h2')
    title.textContent = data.Title || 'Details'
    const closeBtn = document.createElement('button')
    closeBtn.className = 'modal-close'
    closeBtn.innerHTML = '✕'
    header.appendChild(title)
    header.appendChild(closeBtn)

    // content area
    const content = document.createElement('div')
    content.className = 'modal-content'

    // if poster available, show image at top
    if(data.Poster && data.Poster !== 'N/A'){
        const img = document.createElement('img')
        img.className = 'modal-poster'
        img.src = data.Poster
        img.alt = data.Title || 'poster'
        content.appendChild(img)
    }

    // details list (read-only text fields)
    const list = document.createElement('div')
    list.className = 'details-list'

    const skipKeys = new Set(['Poster','Response','Ratings'])

    Object.keys(data).forEach(key => {
        if(skipKeys.has(key)) return
        const value = data[key]
        if(value === 'N/A' || value === null || value === undefined) return

        // if runtime less than 5 minutes, skip
        if(key === 'Runtime'){
            const m = parseInt(String(value).match(/\d+/))
            if(!isNaN(m) && m < 5) return
        }

        const row = document.createElement('div')
        row.className = 'field-row'

        const label = document.createElement('div')
        label.className = 'field-label'

        // prettify key (special mappings + camelCase -> words)
        const special = { imdbRating: 'Imdb Ratings', imdbVotes: 'Imdb Votes', imdbID: 'Imdb ID' }
        let labelText = special[key] || key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')
        labelText = labelText.charAt(0).toUpperCase() + labelText.slice(1)
        label.textContent = labelText

        const valEl = document.createElement('div')
        valEl.className = 'field-value'
        if(key === 'Plot') valEl.classList.add('plot')

        // format value: for objects/arrays stringify, else make first letter uppercase when alphabetic
        if(Array.isArray(value) || typeof value === 'object'){
            try{ valEl.textContent = JSON.stringify(value, null, 2) } catch(e){ valEl.textContent = String(value) }
        } else {
            let s = String(value)
            // do not capitalize imdbID values (e.g. tt1234567)
            if(key === 'imdbID'){
                valEl.textContent = s
            } else {
                if(s.length > 0){
                    const first = s.charAt(0)
                    if(first >= 'a' && first <= 'z') s = first.toUpperCase() + s.slice(1)
                }
                valEl.textContent = s
            }
        }

        row.appendChild(label)
        row.appendChild(valEl)
        list.appendChild(row)
    })

    content.appendChild(list)

    // footer with close
    const footer = document.createElement('div')
    footer.className = 'modal-footer'
    const closeFooter = document.createElement('button')
    closeFooter.type = 'button'
    closeFooter.className = 'modal-close primary'
    closeFooter.textContent = 'Close'
    footer.appendChild(closeFooter)

    modal.appendChild(header)
    modal.appendChild(content)
    modal.appendChild(footer)
    overlay.appendChild(modal)
    document.body.appendChild(overlay)

    function removeModal(){ overlay.remove(); window.removeEventListener('keydown', onKey) }
    closeBtn.addEventListener('click', removeModal)
    closeFooter.addEventListener('click', removeModal)
    overlay.addEventListener('click', (e)=>{ if(e.target === overlay) removeModal() })

    function onKey(e){ if(e.key === 'Escape') removeModal() }
    window.addEventListener('keydown', onKey)
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

showFavBtn.addEventListener("click", () => {
    searchInput.value = ""
    movieGrid.innerHTML = "" 
    navBar.style.display = "none"
    favorites.forEach(movie => {
        createMovieCell(movie)
    })
})