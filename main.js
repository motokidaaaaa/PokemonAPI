const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
const pokemonContainer = document.getElementById('pokemonContainer');
let selectedPokemons = [];
let enemyPokemons = [];
let rotationInterval;

const selectScreenMusic = document.getElementById('selectScreenMusic');
const battleMusic = document.getElementById('battleMusic');
const victoryMusic = document.getElementById('victoryMusic');

async function getRandomPokemon() {
    const randomId = Math.floor(Math.random() * 898) + 1; 
    const response = await fetch(`${API_URL}${randomId}`);
    return await response.json();
}

async function displayRandomPokemon() {
    const pokemon = await getRandomPokemon();
    pokemonContainer.innerHTML = `
        <div class="pokemon-info" onclick="selectPokemon('${pokemon.name}', ${pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}, '${pokemon.sprites.front_default}')">
            <img src="${pokemon.sprites.front_default}" alt="ランダムポケモン">
        </div>
    `;
}

function selectPokemon(name, attack, image) {
    if (selectedPokemons.length < 3) {
        selectedPokemons.push({name, attack, image});
        alert(`${name} きみにきめた!`);
        if (selectedPokemons.length === 3) {
            document.querySelector('button[onclick="startBattle()"]').disabled = false;
        }
    }
}

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

async function startBattle() {
    clearInterval(rotationInterval);
    selectScreenMusic.pause();
    selectScreenMusic.currentTime = 0; 
    battleMusic.play();

    if (selectedPokemons.length < 3) {
        alert('まず3匹のポケモンを選択してください！');
        return;
    }

    await getRandomEnemies();

    let currentPokemonIndex = 0;
    let currentEnemyIndex = 0;
    
    function battleRound() {
        const pokemon = selectedPokemons[currentPokemonIndex];
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
        if (pokemon.attack >= enemy.attack) {
            resultElement.innerHTML = `<h2>${pokemon.name}が勝利した! </h2>`;
            currentEnemyIndex++;
        } else {
            resultElement.innerHTML = `<h2>${enemy.name}が勝利した! </h2>`;
            currentPokemonIndex++;
        }

        if (currentPokemonIndex >= selectedPokemons.length || currentEnemyIndex >= enemyPokemons.length) {
            battleMusic.pause();
            battleMusic.currentTime = 0; 
            const winner = currentEnemyIndex >= enemyPokemons.length ? 'たたかいに勝利した!' : '目の前がまっくらになった';
            resultElement.innerHTML += `<h2> ${winner}</h2>`;
            if (currentEnemyIndex >= enemyPokemons.length) {
                victoryMusic.play();
            }
        } else {
            setTimeout(battleRound, 3000); 
        }
    }

    battleRound();
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
}

function startRotation() {
    displayRandomPokemon();
    rotationInterval = setInterval(displayRandomPokemon, 500); 
}

document.addEventListener('DOMContentLoaded', () => {
    startRotation();
    document.querySelector('button[onclick="startBattle()"]').disabled = true;
    selectScreenMusic.play();
});
