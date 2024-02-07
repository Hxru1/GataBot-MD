import fetch from 'node-fetch'
import fs from 'fs'

const fantasyDBPath = './fantasy.json'
let fantasyDB = []
const validClasses = ['Común', 'Poco Común', 'Raro', 'Épico', 'Legendario', 'Sagrado', 'Supremo', 'Transcendental']

let handler = async (m, { command, usedPrefix, conn, text }) => {
const userId = m.sender
let user = global.db.data.users[userId]

const jsonURL = 'https://raw.githubusercontent.com/GataNina-Li/module/main/imagen_json/anime.json'
const response = await fetch(jsonURL)
const data = await response.json()

if (fs.existsSync(fantasyDBPath)) {
const data = fs.readFileSync(fantasyDBPath, 'utf8')
var fantasyDB = JSON.parse(fs.readFileSync(fantasyDBPath, 'utf8'))
}

let usuarioExistente = fantasyDB.find(user => Object.keys(user)[0] === userId)

if (!usuarioExistente) {
return conn.reply(m.chat, `No tienes personajes.`, m)
}

const idUsuario = Object.keys(usuarioExistente)[0];
const fantasyUsuario = usuarioExistente[idUsuario].fantasy

function obtenerPersonajesDisponibles(userId, fantasyUsuario, infoImg) {
const personajesDisponibles = []
fantasyUsuario.forEach(personaje => {
const info = infoImg.find(img => img.code === personaje.id)
if (info) {
personajesDisponibles.push({
id: personaje.id,
name: personaje.name,
code: personaje.id,
class: info.class
})}
})
return personajesDisponibles
}
    
let seEncontraronPersonajes = null
function construirListaPersonajes(personajes) {
const personajesPorClase = {}
validClasses.forEach(clase => {
personajesPorClase[clase] = []
})
personajes.forEach(personaje => {
personajesPorClase[personaje.class].push(personaje)
})
let listaFinal = ''
validClasses.forEach(clase => {
if (personajesPorClase[clase].length > 0) {
const mensajeClase = `\n*✦ ${clase}*\n${personajesPorClase[clase].map(personaje => `• _${personaje.name}_ » \`\`\`(${personaje.id})\`\`\``).join('\n')}\n`;
listaFinal += mensajeClase
seEncontraronPersonajes = true
}})
if (!seEncontraronPersonajes) {
listaFinal += '*✘* \`\`\`No tienes personajes\`\`\`\n'
}
return listaFinal.trim()
}
const personajesDisponibles = obtenerPersonajesDisponibles(userId, fantasyUsuario, data.infoImg)
const listaPersonajes = construirListaPersonajes(personajesDisponibles)

let totalLikes = 0, totalSuperlikes = 0, totalDislikes = 0;
if (usuarioExistente[idUsuario].flow) {
usuarioExistente[idUsuario].flow.forEach(flow => {
if (flow.like) totalLikes++
if (flow.superlike) totalSuperlikes++
if (flow.dislike) totalDislikes++
})
}

const calificacionTotal = totalLikes + totalSuperlikes + totalDislikes
const personajesGustados = totalLikes > 0 ? totalLikes : `*✘* \`\`\`No has dado me gusta a personajes\`\`\``
const personajesSuperlike = totalSuperlikes > 0 ? totalSuperlikes : `*✘* \`\`\`No has dado me encanta a personajes\`\`\``
const personajesNoGustados = totalDislikes > 0 ? totalDislikes : `*✘* \`\`\`No has dado no me gusta a personajes\`\`\``

let preciosPersonajes = fantasyUsuario.map(personaje => {
const infoPersonaje = data.infoImg.find(img => img.name.toLowerCase() === personaje.name.toLowerCase())
return { name: personaje.name, price: infoPersonaje ? infoPersonaje.price : Infinity }
})
preciosPersonajes.sort((a, b) => a.price - b.price)

const personajeMasBarato = preciosPersonajes.length > 0 ? `✓ _${preciosPersonajes[0].name}_ » \`\`\`${preciosPersonajes[0].price}\`\`\` 🐱` : `*✘* \`\`\`No tienes personajes\`\`\``
let personajeMasCaro = preciosPersonajes.length > 0 ? `✓ _${preciosPersonajes[preciosPersonajes.length - 1].name}_ » \`\`\`${preciosPersonajes[preciosPersonajes.length - 1].price}\`\`\` 🐱` : `*✘* \`\`\`No tienes personajes\`\`\``
if (preciosPersonajes.length > 0 && preciosPersonajes[0].price === preciosPersonajes[preciosPersonajes.length - 1].price) {
personajeMasCaro = `*✘* \`\`\`No hay un Personaje más caro\`\`\``
}

const clases = {}
fantasyUsuario.forEach(personaje => {
const infoPersonaje = data.infoImg.find(img => img.name.toLowerCase() === personaje.name.toLowerCase())
if (infoPersonaje) {
if (!clases[infoPersonaje.class]) clases[infoPersonaje.class] = 0
clases[infoPersonaje.class]++
}})

let claseMasPersonajes = `*✘* \`\`\`No tienes personajes\`\`\``
let claseMenosPersonajes = `*✘* \`\`\`No tienes personajes\`\`\``
    
let maxCount = 0, minCount = Infinity
Object.entries(clases).forEach(([clase, count]) => {
if (count > maxCount) {
maxCount = count
claseMasPersonajes = `*✓* La clase *${clase}* tiene \`\`\`${count}\`\`\` personaje${maxCount === 1 ? '' : 's'}`
}
if (count < minCount && count > 0) {
minCount = count
claseMenosPersonajes = `*✓* La clase *${clase}* tiene \`\`\`${count}\`\`\` personaje${minCount === 1 ? '' : 's'}`
}
if (maxCount === minCount) {
claseMasPersonajes = `*✘* \`\`\`No hay una clase con mayor personajes\`\`\``
}
})

let calificacion, mensajeDesafiosPendientes = null    
calificacion = [5, 10, 15, 20, 30]
mensajeDesafiosPendientes += ''
if (user.fantasy_character2 === 0) {
mensajeDesafiosPendientes += `_Compra *${calificacion[0] - fantasyUsuario.length}* Personajes más para obtener una recompensa_\n*Progreso:* \`\`\`(${fantasyUsuario.length}/${calificacion[0]})\`\`\``
} else if (user.fantasy_character2 === 1) {
mensajeDesafiosPendientes += `_Compra *${calificacion[1] - fantasyUsuario.length}* Personajes más para obtener una recompensa_\n*Progreso:* \`\`\`(${fantasyUsuario.length}/${calificacion[1]})\`\`\``
} else if (user.fantasy_character2 === 2) {
mensajeDesafiosPendientes += `_Compra *${calificacion[2] - fantasyUsuario.length}* Personajes más para obtener una recompensa_\n*Progreso:* \`\`\`(${fantasyUsuario.length}/${calificacion[2]})\`\`\``
} else if (user.fantasy_character2 === 3) {
mensajeDesafiosPendientes += `_Compra *${calificacion[3] - fantasyUsuario.length}* Personajes más para obtener una recompensa_\n*Progreso:* \`\`\`(${fantasyUsuario.length}/${calificacion[3]})\`\`\``
} else if (user.fantasy_character2 === 4) {
mensajeDesafiosPendientes += `_Compra *${calificacion[4] - fantasyUsuario.length}* Personajes más para obtener una recompensa_\n*Progreso:* \`\`\`(${fantasyUsuario.length}/${calificacion[4]})\`\`\``
} else {
mensajeDesafiosPendientes += "*✓* _Has completado todas las misiones_"
}

calificacion = [3, 8, 13, 18, 25, 35, 40, 55, 65, 80, 100]    
let txtLike = ''
if (user.fantasy_character3 === 0) {
txtLike += `_Califica a *${calificacion[0]}* personajes con "👍"_\n*Progreso:* \`\`\`(${personajesGustados}/${calificacion[0]})\`\`\``
} else if (user.fantasy_character3 === 1) {
txtLike += `_Califica a *${calificacion[1] - personajesGustados}* personajes más con "👍"_\n*Progreso:* \`\`\`(${personajesGustados}/${calificacion[1]})\`\`\``
} else if (user.fantasy_character3 === 2) {
txtLike += `_Califica a *${calificacion[2] - personajesGustados}* personajes más con "👍"_\n*Progreso:* \`\`\`(${personajesGustados}/${calificacion[2]})\`\`\``
} else if (user.fantasy_character3 === 3) {
txtLike += `_Califica a *${calificacion[3] - personajesGustados}* personajes más con "👍"_\n*Progreso:* \`\`\`(${personajesGustados}/${calificacion[3]})\`\`\``
} else if (user.fantasy_character3 === 4) {
txtLike += `_Califica a *${calificacion[4] - personajesGustados}* personajes más con "👍"_\n*Progreso:* \`\`\`(${personajesGustados}/${calificacion[4]})\`\`\``
} else if (user.fantasy_character3 === 5) {
txtLike += `_Califica a *${calificacion[5] - personajesGustados}* personajes más con "👍"_\n*Progreso:* \`\`\`(${personajesGustados}/${calificacion[5]})\`\`\``
} else if (user.fantasy_character3 === 6) {
txtLike += `_Califica a *${calificacion[6] - personajesGustados}* personajes más con "👍"_\n*Progreso:* \`\`\`(${personajesGustados}/${calificacion[6]})\`\`\``
} else if (user.fantasy_character3 === 7) {
txtLike += `_Califica a *${calificacion[7] - personajesGustados}* personajes más con "👍"_\n*Progreso:* \`\`\`(${personajesGustados}/${calificacion[7]})\`\`\``
} else if (user.fantasy_character3 === 8) {
txtLike += `_Califica a *${calificacion[8] - personajesGustados}* personajes más con "👍"_\n*Progreso:* \`\`\`(${personajesGustados}/${calificacion[8]})\`\`\``
} else if (user.fantasy_character3 === 9) {
txtLike += `_Califica a *${calificacion[9] - personajesGustados}* personajes más con "👍"_\n*Progreso:* \`\`\`(${personajesGustados}/${calificacion[9]})\`\`\``
} else if (user.fantasy_character3 === 10) {
txtLike += `_Califica a *${calificacion[10] - personajesGustados}* personajes más con "👍"_\n*Progreso:* \`\`\`(${personajesGustados}/${calificacion[10]})\`\`\``
} else {
txtLike += "*✓* _Has completado todas las misiones_"
}

let txtSuperLike = ''
if (user.fantasy_character4 === 0) {
txtSuperLike += `_Califica a *${calificacion[0]}* personajes con "❤️"_\n*Progreso:* \`\`\`(${personajesSuperlike}/${calificacion[0]})\`\`\``
} else if (user.fantasy_character4 === 1) {
txtSuperLike += `_Califica a *${calificacion[1] - personajesSuperlike}* personajes más con "❤️"_\n*Progreso:* \`\`\`(${personajesSuperlike}/${calificacion[1]})\`\`\``
} else if (user.fantasy_character4 === 2) {
txtSuperLike += `_Califica a *${calificacion[2] - personajesSuperlike}* personajes más con "❤️"_\n*Progreso:* \`\`\`(${personajesSuperlike}/${calificacion[2]})\`\`\``
} else if (user.fantasy_character4 === 3) {
txtSuperLike += `_Califica a *${calificacion[3] - personajesSuperlike}* personajes más con "❤️"_\n*Progreso:* \`\`\`(${personajesSuperlike}/${calificacion[3]})\`\`\``
} else if (user.fantasy_character4 === 4) {
txtSuperLike += `_Califica a *${calificacion[4] - personajesSuperlike}* personajes más con "❤️"_\n*Progreso:* \`\`\`(${personajesSuperlike}/${calificacion[4]})\`\`\``
} else if (user.fantasy_character4 === 5) {
txtSuperLike += `_Califica a *${calificacion[5] - personajesSuperlike}* personajes más con "❤️"_\n*Progreso:* \`\`\`(${personajesSuperlike}/${calificacion[5]})\`\`\``
} else if (user.fantasy_character4 === 6) {
txtSuperLike += `_Califica a *${calificacion[6] - personajesSuperlike}* personajes más con "❤️"_\n*Progreso:* \`\`\`(${personajesSuperlike}/${calificacion[6]})\`\`\``
} else if (user.fantasy_character4 === 7) {
txtSuperLike += `_Califica a *${calificacion[7] - personajesSuperlike}* personajes más con "❤️"_\n*Progreso:* \`\`\`(${personajesSuperlike}/${calificacion[7]})\`\`\``
} else if (user.fantasy_character4 === 8) {
txtSuperLike += `_Califica a *${calificacion[8] - personajesSuperlike}* personajes más con "❤️"_\n*Progreso:* \`\`\`(${personajesSuperlike}/${calificacion[8]})\`\`\``
} else if (user.fantasy_character4 === 9) {
txtSuperLike += `_Califica a *${calificacion[9] - personajesSuperlike}* personajes más con "❤️"_\n*Progreso:* \`\`\`(${personajesSuperlike}/${calificacion[9]})\`\`\``
} else if (user.fantasy_character4 === 10) {
txtSuperLike += `_Califica a *${calificacion[10] - personajesSuperlike}* personajes más con "❤️"_\n*Progreso:* \`\`\`(${personajesSuperlike}/${calificacion[10]})\`\`\``
} else {
txtSuperLike += "*✓* _Has completado todas las misiones_"
}

let txtDislike = ''
if (user.fantasy_character5 === 0) {
txtDislike += `_Califica a *${calificacion[0]}* personajes con "👎"_\n*Progreso:* \`\`\`(${personajesNoGustados}/${calificacion[0]})\`\`\``
} else if (user.fantasy_character5 === 1) {
txtDislike += `_Califica a *${calificacion[1] - personajesNoGustados}* personajes más con "👎"_\n*Progreso:* \`\`\`(${personajesNoGustados}/${calificacion[1]})\`\`\``
} else if (user.fantasy_character5 === 2) {
txtDislike += `_Califica a *${calificacion[2] - personajesNoGustados}* personajes más con "👎"_\n*Progreso:* \`\`\`(${personajesNoGustados}/${calificacion[2]})\`\`\``
} else if (user.fantasy_character5 === 3) {
txtDislike += `_Califica a *${calificacion[3] - personajesNoGustados}* personajes más con "👎"_\n*Progreso:* \`\`\`(${personajesNoGustados}/${calificacion[3]})\`\`\``
} else if (user.fantasy_character5 === 4) {
txtDislike += `_Califica a *${calificacion[4] - personajesNoGustados}* personajes más con "👎"_\n*Progreso:* \`\`\`(${personajesNoGustados}/${calificacion[4]})\`\`\``
} else if (user.fantasy_character5 === 5) {
txtDislike += `_Califica a *${calificacion[5] - personajesNoGustados}* personajes más con "👎"_\n*Progreso:* \`\`\`(${personajesNoGustados}/${calificacion[5]})\`\`\``
} else if (user.fantasy_character5 === 6) {
txtDislike += `_Califica a *${calificacion[6] - personajesNoGustados}* personajes más con "👎"_\n*Progreso:* \`\`\`(${personajesNoGustados}/${calificacion[6]})\`\`\``
} else if (user.fantasy_character5 === 7) {
txtDislike += `_Califica a *${calificacion[7] - personajesNoGustados}* personajes más con "👎"_\n*Progreso:* \`\`\`(${personajesNoGustados}/${calificacion[7]})\`\`\``
} else if (user.fantasy_character5 === 8) {
txtDislike += `_Califica a *${calificacion[8] - personajesNoGustados}* personajes más con "👎"_\n*Progreso:* \`\`\`(${personajesNoGustados}/${calificacion[8]})\`\`\``
} else if (user.fantasy_character5 === 9) {
txtDislike += `_Califica a *${calificacion[9] - personajesNoGustados}* personajes más con "👎"_\n*Progreso:* \`\`\`(${personajesNoGustados}/${calificacion[9]})\`\`\``
} else if (user.fantasy_character5 === 10) {
txtDislike += `_Califica a *${calificacion[10] - personajesNoGustados}* personajes más con "👎"_\n*Progreso:* \`\`\`(${personajesNoGustados}/${calificacion[10]})\`\`\``
} else {
txtDislike += "*✓* _Has completado todas las misiones_"
}

const mensaje = `
🌟 *❰ Información de tus personajes ❱* 🌟
    
*❰ Total de personajes ❱* 
${fantasyUsuario.length > 0 ? `*✓* \`\`\`${fantasyUsuario.length}\`\`\`` : `*✘* \`\`\`No tienes personajes\`\`\``}

*❰ Tus personajes ❱*
${listaPersonajes}
    
*❰ Calificación total de personajes ❱* 
${calificacionTotal > 0 ? `*✓* \`\`\`${calificacionTotal}\`\`\`` : `*✘* \`\`\`No has calificado personajes\`\`\``}
    
*❰ Personajes que has dado 👍 ❱* 
${personajesGustados > 0 ? `*✓* \`\`\`${personajesGustados}\`\`\`` : personajesGustados}
    
*❰ Personajes que has dado ❤️ ❱* 
${personajesSuperlike > 0 ? `*✓* \`\`\`${personajesSuperlike}\`\`\`` : personajesSuperlike}
    
*❰ Personajes que has dado 👎 ❱*
${personajesNoGustados > 0 ? `*✓* \`\`\`${personajesNoGustados}\`\`\`` : personajesNoGustados}
    
*❰ Tú personaje más barato ❱* 
${personajeMasBarato}
    
*❰ Tú personaje más caro ❱* 
${personajeMasCaro}

*❰ Clase con menos personajes ❱* 
${claseMenosPersonajes}
    
*❰ Clase con más personajes ❱* 
${claseMasPersonajes}


🔒 *❰ Desafíos por desbloquear ❱* 🔒

*❰ ¿Puedes calificar personajes? ❱*
${user.fantasy_character === 1 ? '*✓* \`\`\`Sí\`\`\`' : '*✘* \`\`\`No\`\`\`'}

*❰ Por personajes ❱*
${fantasyUsuario.length > 0 ? mensajeDesafiosPendientes : `*✘* \`\`\`No tienes personajes\`\`\``}

*❰ Por dar 👍 ❱* 
${personajesGustados > 0 ? txtLike : personajesGustados}

*❰ Por dar ❤️ ❱* 
${personajesGustados > 0 ? txtSuperLike : personajesGustados}

*❰ Por dar 👎 ❱* 
${personajesNoGustados > 0 ? txtDislike : personajesNoGustados}
`
conn.reply(m.chat, mensaje.trim(), m)
}

handler.command = /^(fantasymy|fymy)$/i
export default handler
