const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
const pokemonContainer = document.getElementById('pokemonContainer');
let selectedPokemons = [];
let enemyPokemons = [];
let rotationInterval;

const selectScreenMusic = document.getElementById('selectScreenMusic');
const battleMusic = document.getElementById('battleMusic');
const victoryMusic = document.getElementById('victoryMusic');
const battleText = document.getElementById('battleText');
const mainTitle = document.querySelector('h2');

const images = {
    start: './start-background.jpg',
    select: './select-background.jpg',
    battle: './battle-background.jpg',
    victory: './victory-background.jpg',
    defeat: './defeat-background.jpg'
};

// 日本語名の取得
async function japaneseName(pokemon) {
    const nameurl = `https://pokeapi.co/api/v2/pokemon-species/${pokemon.name}`;
    const response = await fetch(nameurl);
    if (!response.ok) {
        throw new Error('ネットワークエラーが発生しました');
    }
    const results = await response.json();
    for (const info of results["names"]) {
        if (info["language"]["name"] === 'ja-Hrkt') {
            pokemon.name = info['name'];
            break;
        }
    }
}

// ランダムなポケモンを取得する関数
async function getRandomPokemon() {
    const randomId = Math.floor(Math.random() * 898) + 1; 
    const response = await fetch(`${API_URL}${randomId}`);
    const pokemon = await response.json();
    await japaneseName(pokemon);
    return pokemon;
}

// ランダムなポケモンを表示する関数
async function displayRandomPokemon() {
    const pokemon = await getRandomPokemon();
    pokemonContainer.innerHTML = `
        <div class="pokemon-info" onclick="selectPokemon('${pokemon.name}', ${pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}, '${pokemon.sprites.front_default}')">
            <img src="${pokemon.sprites.front_default}" alt="ランダムポケモン">
            <img src="pokeball.png" alt="ポケモンボール" class="pokeball">
        </div>
    `;
}

// ポケモンを選択する関数
function selectPokemon(name, attack, image) {
    if (selectedPokemons.length < 3) {
        selectedPokemons.push({name, attack, image});
        alert(`${name} きみにきめた!`);
        if (selectedPokemons.length === 3) {
            document.querySelector('button[onclick="startBattle()"]').disabled = false;
        }
    }
}

// ランダムな敵ポケモンを取得する関数
async function getRandomEnemies() {
    enemyPokemons = [];
    for (let i = 0; i < 3; i++) {
        const enemy = await getRandomPokemon();
        enemyPokemons.push({
            name: enemy.name,
            attack: enemy.stats.find(stat => stat.stat.name === 'attack').base_stat,
            image: enemy.sprites.front_default
        });
    }
}

// バトルテキストを表示する関数
function showBattleText(text) {
    battleText.innerHTML = text;
    setTimeout(() => {
        battleText.innerHTML = '';
    }, 2000);
}

// バトルを開始する関数
async function startBattle() {
    clearInterval(rotationInterval);
    selectScreenMusic.pause();
    selectScreenMusic.currentTime = 0; 
    battleMusic.play();
    document.body.className = 'battling';
    mainTitle.textContent = "ポケモンを選択して戦おう！";

    if (selectedPokemons.length < 3) {
        alert('まず3匹のポケモンを選択してください！');
        return;
    }

    await getRandomEnemies();

    let currentEnemyIndex = 0;

    function battleRound(playerPokemonIndex) {
        const pokemon = selectedPokemons[playerPokemonIndex];
        const enemy = enemyPokemons[currentEnemyIndex];

        pokemonContainer.innerHTML = `
            <div class="pokemon-info">
                <h2>${pokemon.name}</h2>
                <img src="${pokemon.image}" alt="${pokemon.name}">
                <p>攻撃力: ${pokemon.attack}</p>
            </div>
            <div class="pokemon-info">
                <h2>${enemy.name}</h2>
                <img src="${enemy.image}" alt="${enemy.name}">
                <p>攻撃力: ${enemy.attack}</p>
            </div>
        `;

        const resultElement = document.getElementById('result');
        setTimeout(() => {
            if (pokemon.attack >= enemy.attack) {
                resultElement.innerHTML = `<h2>${pokemon.name}が勝利した! </h2>`;
                currentEnemyIndex++;
            } else {
                resultElement.innerHTML = `<h2>${enemy.name}が勝利した! </h2>`;
                selectedPokemons.splice(playerPokemonIndex, 1);
            }

            if (currentEnemyIndex >= enemyPokemons.length) {
                battleMusic.pause();
                battleMusic.currentTime = 0; 
                showBattleText('');
                setTimeout(() => {
                    resultElement.innerHTML += `<h2>たたかいに勝利した!</h2>`;
                    victoryMusic.play();
                    document.body.className = 'victory';
                    setTimeout(() => {
                        resultElement.innerHTML = '';
                        resetBattle();
                    }, 3000);
                }, 2000);
            } else if (selectedPokemons.length === 0) {
                battleMusic.pause();
                battleMusic.currentTime = 0; 
                setTimeout(() => {
                    resultElement.innerHTML += `<h2>目の前がまっくらになった</h2>`;
                    document.body.className = 'defeat';
                    setTimeout(() => {
                        resultElement.innerHTML = '';
                        resetBattle();
                    }, 3000);
                }, 2000);
            } else {
                setTimeout(selectPokemonForBattle, 3000);
            }
        }, 2000);
    }

    function selectPokemonForBattle() {
        pokemonContainer.innerHTML = '';
        selectedPokemons.forEach((pokemon, index) => {
            const pokemonDiv = document.createElement('div');
            pokemonDiv.className = 'pokemon-info';
            pokemonDiv.innerHTML = `
                <h2>${pokemon.name}</h2>
                <img src="${pokemon.image}" alt="${pokemon.name}">
                <img src="images.png" alt="ポケモンボール" class="pokeball">
                <p>攻撃力: ${pokemon.attack}</p>
            `;
            pokemonDiv.onclick = () => {
                battleRound(index);
            };
            pokemonContainer.appendChild(pokemonDiv);
        });
    }

    selectPokemonForBattle();
}

function resetBattle() {
    selectedPokemons = [];
    enemyPokemons = [];
    document.getElementById('result').innerHTML = '';
    document.querySelector('button[onclick="startBattle()"]').disabled = true;
    startRotation();
    victoryMusic.pause();
    victoryMusic.currentTime = 0; 
    selectScreenMusic.play();
    document.body.className = 'selecting';
    mainTitle.textContent = "ポケモンをクリックして三体捕まえろ！";
}

function startRotation() {
    displayRandomPokemon();
    rotationInterval = setInterval(displayRandomPokemon, 500); 
}

document.addEventListener('DOMContentLoaded', () => {
    startRotation();
    document.querySelector('button[onclick="startBattle()"]').disabled = true;
    selectScreenMusic.play();
    document.body.className = 'selecting';
});

