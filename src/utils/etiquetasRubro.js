const diccionario = require('./diccionarioRubros');

function getEtiquetas(rubro) {
    return diccionario[rubro] || diccionario.tecnico_pc; // fallback seguro
}

module.exports = { getEtiquetas };