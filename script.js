
const search = document.getElementById('search')
const animes = document.getElementById("animes")
const generos = document.getElementById("generos")
const anos = document.getElementById("ano")
const carta = document.getElementsByClassName("card")
const favoritos = document.getElementById("favoritos")
const carregando = document.getElementById("carregando")


var id = 0 //valor para comparar com id do anime evitando duplicatas
var pag = 1 //controlador de qual pagina da api estamos


//verifica se o carregando está na tela, se estiver carrega mais linhas
function ta_na_tela(element) {
    const rect = element.getBoundingClientRect();
    if(rect.bottom <= (window.innerHeight)){
        console.log("carregando")
        carrega_linha()
    }}




window.addEventListener("scroll", function() {
    if ( window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
        carrega_linha();
    }
});

generos.addEventListener("change", function(){
    animes.innerHTML = ""
    id = 0
    pag = 1
    carrega_linha()
})

anos.addEventListener("change", function(){
    animes.innerHTML = ""
    id = 0
    pag = 1
    controle = 0
    carrega_linha()
})


//cria select com os generos da API
function cria_selects(){
    let url = 'https://api.jikan.moe/v4/genres/anime'
    let url_seasons = 'https://api.jikan.moe/v4/seasons'
    fetch(url)
    .then(response => response.json())
    .then(data =>{
        data.data.forEach(genero =>{
            let opcao = document.createElement("option")
            opcao.innerHTML = genero.name
            generos.appendChild(opcao)
        })
    })
    fetch(url_seasons)
    .then(response => response.json())
    .then(data =>{
        data.data.forEach(ano =>{
            let opcao = document.createElement("option")
            opcao.innerHTML = ano.year
            anos.appendChild(opcao)
        })
    })
}

//passa as pags da api enviando os animes pro filtro
function carrega_linha(){
        let url = `https://api.jikan.moe/v4/anime?page=`
        url = url + pag
        fetch(url)
        .then(response => response.json())
        .then(data => {
            data.data.forEach(anime =>{
                filtro(anime)
            })
        })
        pag = 1 + parseInt(pag)
}

//filtra os animes mandando pra criação de cards
function filtro(anime){
    let alvo_ano = anos.value
    let alvo_gen = generos.value
    anime.genres.forEach(genero =>{
        if(id < anime.mal_id){
            if((genero.name == alvo_gen || alvo_gen == '') && (alvo_ano == '' || alvo_ano == anime.year)){
                cria_cards(anime, animes)
                id = anime.mal_id
            }
        }
    })
}

//criando favoritos a partir do localstorage
function cria_favoritos(){
    favoritos.innerHTML = ''
    let lista_fav = localStorage.getItem("animes").split(',')
    lista_fav.forEach(id_fav =>{
        let url_fav = `https://api.jikan.moe/v4/anime/` + id_fav
        fetch(url_fav)
        .then(response => response.json())
        .then(data =>{
            cria_cards(data.data, favoritos)
        })
    })

}

//cria os cards de anime
function cria_cards(anime, destino){
    let div = document.createElement('div')
    let div_img = document.createElement('div')
    let div_dados = document.createElement('div')
    let cartaz = document.createElement('img')
    let infos = document.createElement('div')
    let heart = document.createElement('img')
    let array_gens = ''
    let conteudo = ''

    //lendo os generos
    anime.genres.forEach(genero =>{
        array_gens += genero.name + "<br>"
    })
    //buscando a imagem e o conteúdo
    cartaz.src = anime.images.jpg.image_url 
    conteudo += '<p>Nome:<br>' + anime.title + '</p>'
    conteudo += '<p>Generos:<br>' + array_gens + '</p>'
    
    if(anime.year === null){
        conteudo += "<p>Data de estreia:<br>não identificado</p>"
    }else{
        conteudo += "<p>Data de estreia:<br> " + anime.year + '</p>'
    }
    
    //fazendo o info e sumindo com 
    if(destino == favoritos){
        infos.innerHTML = '<b id="salvar">' + conteudo + '</b>' + "Remover: "
    }else{
        infos.innerHTML = '<b id="salvar">' + conteudo + '</b>' + "Salvar: "
    }
    infos.style.display = "none"

    //estilização dos cartões
    div.classList.add("card")
    
    //criando botão de salvar
    heart.src = 'https://icon-library.com/images/free-heart-icon/free-heart-icon-20.jpg'
    heart.style.height = "1rem"
    heart.style.width = '1rem'

    //salvando no localstore
    heart.addEventListener('click', ()=>{
        let lista_local = []
        if (localStorage.getItem("animes") != null && localStorage.getItem("animes") != ''){
            lista_local = localStorage.getItem("animes").split(',')
            localStorage.removeItem("animes")
            if(lista_local.includes(anime.mal_id.toString())){
                lista_local = lista_local.filter(id_local => id_local !== anime.mal_id.toString());
                localStorage.setItem("animes", lista_local)
            }else{
                localStorage.setItem("animes", lista_local + ',' + anime.mal_id )
            }
        }else{
            localStorage.setItem("animes", anime.mal_id)
        }
        cria_favoritos()
    })
    //aumenta e diminui os cards
    cartaz.addEventListener('click', function() {
        if(infos.style.display === 'block'){
            infos.style.display = 'none'
            div.style.height = "21rem"
        }else{
        infos.style.display = 'block'
        div.style.height = "46rem"
        div.style.alignItems = "start"
        div.style.transition = 'width 0.5s ease-in-out, height 0.5s ease-in-out;'
        }
    });

    div.appendChild(div_img)
    div.appendChild(div_dados)
    div_img.appendChild(cartaz)
    div_dados.appendChild(div_img)
    div_dados.appendChild(infos)
    infos.appendChild(heart)
    destino.appendChild(div)
    setTimeout(()=>{
        div.classList.add('surgir')
    },100)
}


//verifica o carregando a cada 1s para não sobrecarregar a API
setInterval(()=>{
    ta_na_tela(carregando)
}, 1000)


cria_selects()
carrega_linha()
