const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
const pokemonContainer = document.getElementById('pokemonContainer');
let selectedPokemons = [];
let enemyPokemons = [];
let rotationInterval;

const selectScreenMusic = document.getElementById('selectScreenMusic');
const battleMusic = document.getElementById('battleMusic');
const victoryMusic = document.getElementById('victoryMusic');
const battleText = document.getElementById('battleText');
const mainTitle = document.querySelector('.container h2'); // h2要素を取得

// スタート画面の要素
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');

// ランダムなポケモンを取得する関数
async function getRandomPokemon() {
    const randomId = Math.floor(Math.random() * 898) + 1; 
    const response = await fetch(`${API_URL}${randomId}`);
    return await response.json();
}

// ランダムなポケモンを表示する関数
async function displayRandomPokemon() {
    const pokemon = await getRandomPokemon();
    pokemonContainer.innerHTML = `
        <div class="pokemon-info" onclick="selectPokemon('${pokemon.name}', ${pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}, '${pokemon.sprites.front_default}')">
            <img src="${pokemon.sprites.front_default}" alt="ランダムポケモン">
        </div>
    `;
}

// ポケモンを選択する関数
function selectPokemon(name, attack, image) {
    if (selectedPokemons.length < 3) {
        selectedPokemons.push({name, attack, image});
        alert(`${name} きみにきめた!`);
        if (selectedPokemons.length === 3) {
            startBattle(); // 3体選ばれたら自動的にバトルを開始
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

// ゲームを開始する関数
function startGame() {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    selectScreenMusic.play();
}

// バトルを開始する関数
async function startBattle() {
    clearInterval(rotationInterval);
    selectScreenMusic.pause();
    selectScreenMusic.currentTime = 0; 
    battleMusic.play();
    document.body.className = 'battling';
    mainTitle.textContent = "ポケモンを選択して戦おう！"; // バトル開始時にh2テキストを変更

    await getRandomEnemies();

    let currentEnemyIndex = 0;

    // バトルの各ラウンドを処理する関数
    function battleRound(playerPokemonIndex) {
        const pokemon = selectedPokemons[playerPokemonIndex];
        const enemy = enemyPokemons[currentEnemyIndex];

        showBattleText(`${pokemon.name} VS ${enemy.name}!`);

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
                selectedPokemons.splice(playerPokemonIndex, 1); // 負けたポケモンをリストから削除
            }

            // バトルの終了条件
            if (currentEnemyIndex >= enemyPokemons.length) {
                battleMusic.pause();
                battleMusic.currentTime = 0; 
                showBattleText('勝利判定...');
                setTimeout(() => {
                    resultElement.innerHTML += `<h2>たたかいに勝利した!</h2>`;
                    victoryMusic.play();
                    document.body.className = 'victory';
                }, 2000);
            } else if (selectedPokemons.length === 0) {
                battleMusic.pause();
                battleMusic.currentTime = 0; 
                showBattleText('敗北判定...');
                setTimeout(() => {
                    resultElement.innerHTML += `<h2>目の前がまっくらになった</h2>`;
                    document.body.className = 'defeat';
                }, 2000);
            } else {
                // 次のラウンドのためにポケモンを選択する
                setTimeout(selectPokemonForBattle, 3000);
            }
        }, 2000);
    }

    // バトル用にポケモンを選択する関数
    function selectPokemonForBattle() {
        showBattleText('ポケモンを選んで！');
        pokemonContainer.innerHTML = '';
        selectedPokemons.forEach((pokemon, index) => {
            const pokemonDiv = document.createElement('div');
            pokemonDiv.className = 'pokemon-info';
            pokemonDiv.innerHTML = `
                <h2>${pokemon.name}</h2>
                <img src="${pokemon.image}" alt="${pokemon.name}">
                <img src="images.png" alt="" class="pokeball">
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

// バトルをリセットする関数
function resetBattle() {
    selectedPokemons = [];
    enemyPokemons = [];
    document.getElementById('result').innerHTML = '';
    startRotation();
    victoryMusic.pause();
    victoryMusic.currentTime = 0; 
    selectScreenMusic.play();
    document.body.className = 'selecting';
    mainTitle.textContent = "ポケモンをクリックして三体捕まえろ！"; // リセット時にh2テキストを変更
}

// ランダムポケモンの表示を開始する関数
function startRotation() {
    displayRandomPokemon();
    rotationInterval = setInterval(displayRandomPokemon, 500); 
}

document.addEventListener('DOMContentLoaded', () => {
    startRotation();
    selectScreenMusic.play();
    document.body.className = 'selecting';
});
