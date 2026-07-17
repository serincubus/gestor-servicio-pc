// src/database/models/asociaciones.js
const { DataTypes } = require('sequelize');
const db = require('../db.js'); // Importamos tu conexión

const Cliente = require('./Cliente.js');
const Ticket = require('./Ticket.js');
const Hardware = require('./Hardware.js');
const TicketHardware = require('./TicketHardware.js');

// Un Cliente tiene muchos Tickets (1:N)
Cliente.hasMany(Ticket, { foreignKey: 'id_cliente', as: 'tickets', onDelete: 'CASCADE' });

// Un Ticket pertenece a un solo Cliente
Ticket.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });



module.exports = { Cliente, Ticket };
