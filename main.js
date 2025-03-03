const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
const pokemonContainer = document.getElementById('pokemonContainer');
let selectedPokemons = [];
let enemyPokemons = [];
let rotationInterval;

const selectScreenMusic = document.getElementById('selectScreenMusic');
const battleMusic = document.getElementById('battleMusic');
const victoryMusic = document.getElementById('victoryMusic');
const loseMusic = document.getElementById('loseMusic'); // 追加した敗北音楽
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
    await japaneseName(pokemon); // 日本語名を取得
    return pokemon;
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
    selectScreenMusic.play(); // 選択画面の音楽を再生
    if (selectedPokemons.length < 3) {
        selectedPokemons.push({name, attack, image});
        alert(`${name} きみにきめた!`);
        if (selectedPokemons.length === 3) {
            startBattle(); // 3体選択されたらバトルを開始
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

// バトルを開始する関数
async function startBattle() {
    clearInterval(rotationInterval); // ポケモンの回転表示を停止
    selectScreenMusic.pause(); // 選択画面の音楽を停止
    selectScreenMusic.currentTime = 0; 
    battleMusic.play(); // バトル音楽を再生
    document.body.className = 'battling'; // バトル中のクラスを設定
    mainTitle.textContent = "ポケモンを選択して戦おう！"; 
    document.getElementById('result').innerHTML = ''; // バトル開始時に勝利テキストを消す

    await getRandomEnemies(); // ランダムな敵ポケモンを取得

    let currentEnemyIndex = 0;

    // バトルラウンドを処理する関数
    function battleRound(playerPokemonIndex) {
        const pokemon = selectedPokemons[playerPokemonIndex];
        const enemy = enemyPokemons[currentEnemyIndex];

        pokemonContainer.innerHTML = `
            <div class="pokemon-info player-pokemon">
                <span class="label">みかたのポケモン</span>
                <h2>${pokemon.name}</h2>
                <img src="${pokemon.image}" alt="${pokemon.name}">
                <p>攻撃力: ${pokemon.attack}</p>
            </div>
            <div class="pokemon-info enemy-pokemon">
                <span class="label">あいてのポケモン</span>
                <h2>${enemy.name}</h2>
                <img src="${enemy.image}" alt="${enemy.name}">
                <p>攻撃力: ${enemy.attack}</p>
            </div>
        `;

        const resultElement = document.getElementById('result');
        setTimeout(() => {
            if (pokemon.attack >= enemy.attack) {
                resultElement.innerHTML = `<h2>${pokemon.name}が勝利した!</h2>`;
                currentEnemyIndex++;
            } else {
                resultElement.innerHTML = `<h2>${enemy.name}が勝利した!</h2>`;
                selectedPokemons.splice(playerPokemonIndex, 1); 
            }

            // 勝利テキストをバトル中に表示しない
            setTimeout(() => {
                resultElement.innerHTML = ''; 
            }, 2000);

            if (currentEnemyIndex >= enemyPokemons.length) {
                battleMusic.pause(); // バトル音楽を停止
                battleMusic.currentTime = 0; 
                setTimeout(() => {
                    resultElement.innerHTML = `<h2>たたかいに勝利した!</h2>`;
                    victoryMusic.play(); // 勝利音楽を再生
                    document.body.className = 'victory'; // 勝利クラスを設定
                    container.style.backgroundImage = "none"; // コンテナの背景画像を削除
                }, 2000);
            } else if (selectedPokemons.length === 0) {
                battleMusic.pause(); // バトル音楽を停止
                battleMusic.currentTime = 0; 
                setTimeout(() => {
                    resultElement.innerHTML = `<h2>目の前がまっくらになった</h2>`;
                    loseMusic.play(); // 敗北音楽を再生
                    document.body.className = 'defeat'; // 敗北クラスを設定
                    container.style.backgroundImage = "none"; // コンテナの背景画像を削除
                }, 2000);
            } else {
                setTimeout(selectPokemonForBattle, 3000); // 次のバトルラウンドを開始
            }
        }, 2000);
    }

    // バトル用のポケモンを選択する関数
    function selectPokemonForBattle() {
        pokemonContainer.innerHTML = '';
        selectedPokemons.forEach((pokemon, index) => {
            const pokemonDiv = document.createElement('div');
            pokemonDiv.className = 'pokemon-info player-pokemon';
            pokemonDiv.innerHTML = `
                <span class="label">味方ポケモン</span>
                <h2>${pokemon.name}</h2>
                <img src="${pokemon.image}" alt="${pokemon.name}">
                <p>攻撃力: ${pokemon.attack}</p>
            `;
            pokemonDiv.onclick = () => {
                battleRound(index); // クリックされたポケモンでバトルラウンドを開始
            };
            pokemonContainer.appendChild(pokemonDiv);
        });
    }

    selectPokemonForBattle(); // バトル用ポケモンの選択を開始
}

// バトルをリセットする関数
function resetBattle() {
    selectedPokemons = [];
    enemyPokemons = [];
    document.getElementById('result').innerHTML = ''; // リセット時に勝利テキストを消す
    victoryMusic.pause(); // 勝利音楽を停止
    loseMusic.pause(); // 敗北音楽を停止
    victoryMusic.currentTime = 0; 
    selectScreenMusic.play(); // 選択画面の音楽を再生
    document.body.className = 'selecting'; // 選択クラスを設定
    mainTitle.textContent = "ポケモンをクリックして三体捕まえろ！";
    startRotation(); // ランダムなポケモン表示を開始
}

// ランダムなポケモン表示を開始する関数
function startRotation() {
    displayRandomPokemon();
    rotationInterval = setInterval(displayRandomPokemon, 1500); // ポケモンを1.5秒ごとに回転表示
}

document.addEventListener('DOMContentLoaded', () => {
    startRotation(); // ページ読み込み時にランダムなポケモン表示を開始
    document.body.className = 'selecting'; // 選択クラスを設定
    selectScreenMusic.play(); // 選択画面の音楽を再生
});
