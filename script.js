// Elementos do DOM
const gradeFilmes = document.getElementById('grade-filmes');
const seletorGenero = document.getElementById('seletor-genero');
const btnContraste = document.getElementById('btn-contraste');
const txtContraste = document.getElementById('txt-contraste');
const botoesIdioma = document.querySelectorAll('.btn-idioma');
const btnPararLeitura = document.getElementById('btn-parar-leitura');

let catalogoCompleto = [];

// 1. Consumo da API Pública (TVMaze)
async function carregarCatalogo() {
    try {
        // Busca uma lista diversificada de produções
        const resposta = await fetch('https://api.tvmaze.com/shows?page=1');
        if (!resposta.ok) throw new Error('Falha ao conectar com a API');
        
        const dados = await resposta.json();
        
        // Seleciona 24 obras variadas com imagem disponível
        catalogoCompleto = dados
            .filter(item => item.image && item.image.medium)
            .slice(0, 24);

        renderizarCards(catalogoCompleto);
    } catch (erro) {
        gradeFilmes.innerHTML = `<p role="alert">Erro ao carregar o catálogo: ${erro.message}. Verifique sua conexão.</p>`;
    }
}

// 2. Gerador de Comentário de Crítico de Cinema
function gerarParecerCritico(obra) {
    const nota = obra.rating?.average || 7.5;
    const generos = obra.genres || [];
    
    let tomCritico = "";
    if (nota >= 8.5) {
        tomCritico = "Obra-prima indispensável. Direção segura e roteiro envolvente que prende a atenção do início ao fim.";
    } else if (nota >= 7.0) {
        tomCritico = "Excelente execução técnica e ritmo equilibrado. Uma escolha sólida para quem busca entretenimento de qualidade.";
    } else {
        tomCritico = "Proposta curiosa com momentos inspirados, embora apresente irregularidades na condução narrativa.";
    }

    if (generos.includes('Comedy')) {
        tomCritico += " Destaca-se pelo timing cômico afiado e diálogos inteligentes.";
    } else if (generos.includes('Documentary')) {
        tomCritico += " Cumpre com maestria seu papel educativo e informativo.";
    }

    return `${tomCritico} (Avaliação da Crítica: ${nota}/10)`;
}

// 3. Renderização dos Cards na Tela
function renderizarCards(lista) {
    gradeFilmes.innerHTML = '';

    if (lista.length === 0) {
        gradeFilmes.innerHTML = '<p>Nenhuma obra encontrada para este gênero no momento.</p>';
        return;
    }

    lista.forEach(obra => {
        // Limpa tags HTML da sinopse original
        const sinopseLimpa = obra.summary 
            ? obra.summary.replace(/<[^>]*>?/gm, '').slice(0, 140) + '...' 
            : 'Sinopse indisponível no acervo.';

        const generosTexto = obra.genres.length > 0 ? obra.genres.join(', ') : 'Variedades';
        const parecerCritico = gerarParecerCritico(obra);

        const card = document.createElement('article');
        card.className = 'card-filme';
        card.setAttribute('tabindex', '0');

        card.innerHTML = `
            <div class="poster-container">
                <img 
                    src="${obra.image.medium}" 
                    alt="Pôster promocional de ${obra.name}" 
                    class="poster-filme"
                    loading="lazy"
                >
            </div>
            <div class="card-conteudo">
                <div>
                    <span class="card-genero">${generosTexto}</span>
                    <h3 class="card-titulo">${obra.name}</h3>
                    <p>${sinopseLimpa}</p>
                    
                    <div class="critica-box">
                        <span class="critica-titulo"><i class="fas fa-pen-nib"></i> Parecer do Crítico:</span>
                        <p>${parecerCritico}</p>
                    </div>
                </div>
                <button class="btn-ouvir-card" onclick="lerTextoEspecifico('${obra.name.replace(/'/g, "")}. ${parecerCritico.replace(/'/g, "")}', 'pt-BR')">
                    <i class="fas fa-volume-up"></i> Ouvir Crítica
                </button>
            </div>
        `;

        gradeFilmes.appendChild(card);
    });
}

// 4. Filtro por Gênero
seletorGenero.addEventListener('change', (evento) => {
    const generoEscolhido = evento.target.value;

    if (generoEscolhido === 'todos') {
        renderizarCards(catalogoCompleto);
    } else {
        const filtrados = catalogoCompleto.filter(obra => 
            obra.genres && obra.genres.includes(generoEscolhido)
        );
        renderizarCards(filtrados);
    }
});

// 5. Alternância de Tema (Clarear / Escurecer Alto Contraste)
btnContraste.addEventListener('click', () => {
    const isClaro = document.body.classList.toggle('tema-claro');
    btnContraste.setAttribute('aria-pressed', isClaro);
    
    if (isClaro) {
        txtContraste.textContent = 'Modo Escuro (Sala de Cinema)';
    } else {
        txtContraste.textContent = 'Modo Claro (Alto Contraste)';
    }
});

// 6. Síntese de Voz Multilíngue (Português, Inglês e Espanhol)
function lerTextoEspecifico(texto, idioma) {
    window.speechSynthesis.cancel(); // Interrompe qualquer fala anterior
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = idioma;
    fala.rate = 0.95; // Velocidade levemente reduzida para maior clareza
    window.speechSynthesis.speak(fala);
}

botoesIdioma.forEach(botao => {
    botao.addEventListener('click', () => {
        const idiomaSelecionado = botao.getAttribute('data-lang');
        const conteudoPrincipal = document.getElementById('conteudo-principal').innerText;
        lerTextoEspecifico(conteudoPrincipal, idiomaSelecionado);
    });
});

btnPararLeitura.addEventListener('click', () => {
    window.speechSynthesis.cancel();
});

// Inicializa a aplicação
carregarCatalogo();