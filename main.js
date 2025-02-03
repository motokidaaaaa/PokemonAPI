const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
const pokemonContainer = document.getElementById('pokemonContainer');
let selectedPokemons = [];
let enemyPokemons = [];
let rotationInterval;

async function getRandomPokemon() {
    const randomId = Math.floor(Math.random() * 898) + 1; // ポケモンの数は898まで
    const response = await fetch(`${API_URL}${randomId}`);
    return await response.json();
}

async function displayRandomPokemon() {
    const pokemon = await getRandomPokemon();
    pokemonContainer.innerHTML = `
        <div class="pokemon-info" onclick="selectPokemon('${pokemon.name}', ${pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}, '${pokemon.sprites.front_default}')">
            <h2>${pokemon.name}</h2>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        </div>
    `;
}

function selectPokemon(name, attack, image) {
    if (selectedPokemons.length < 3) {
        selectedPokemons.push({name, attack, image});
        alert(`${name} selected!`);
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

    if (selectedPokemons.length < 3) {
        alert('Please select 3 Pokemons first!');
        return;
    }

    await getRandomEnemies();

    pokemonContainer.innerHTML = '';
    selectedPokemons.forEach((pokemon, index) => {
        const enemy = enemyPokemons[index];
        const pokemonElement = document.createElement('div');
        pokemonElement.classList.add('pokemon-info');
        pokemonElement.innerHTML = `
            <div>
                <h2>${pokemon.name}</h2>
                <img src="${pokemon.image}" alt="${pokemon.name}">
                <p>Attack: ${pokemon.attack}</p>
            </div>
            <div>
                <h2>${enemy.name}</h2>
                <img src="${enemy.image}" alt="${enemy.name}">
                <p>Attack: ${enemy.attack}</p>
            </div>
        `;
        pokemonContainer.appendChild(pokemonElement);
    });

    const totalAttack = selectedPokemons.reduce((sum, pokemon) => sum + pokemon.attack, 0);
    const enemyTotalAttack = enemyPokemons.reduce((sum, pokemon) => sum + pokemon.attack, 0);
    
    const resultElement = document.getElementById('result');
    const winner = totalAttack > enemyTotalAttack ? 'You win!' : 'You lose!';
    
    resultElement.innerHTML = `<h2>${winner}</h2>`;
}

function resetBattle() {
    selectedPokemons = [];
    document.getElementById('result').innerHTML = '';
    document.querySelector('button[onclick="startBattle()"]').disabled = true;
    startRotation();
}

function startRotation() {
    displayRandomPokemon();
    rotationInterval = setInterval(displayRandomPokemon, 5000); 
}

document.addEventListener('DOMContentLoaded', () => {
    startRotation();
    document.querySelector('button[onclick="startBattle()"]').disabled = true;
});
