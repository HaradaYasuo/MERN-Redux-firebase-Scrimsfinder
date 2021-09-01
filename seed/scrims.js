const db = require('../db/connection');
const faker = require('faker');
const Scrim = require('../models/scrim');
const setHours = require('../utils/setHours');
const sample = require('../utils/sample');

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const main = async () => {
  const roles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

  const ranks = [
    'Diamond 2',
    'Platinum 1',
    'Silver 3',
    'Bronze 1',
    'Gold 2',
    'Master',
  ];

  const teamOnePlayers = [
    {
      name: 'GitCat',
      role: 'Top',
      rank: 'Diamond 1',
      region: 'NA',
      discord: 'Test#123',
    },
    {
      name: 'AmumuCrying',
      role: 'Jungle',
      rank: 'Silver 2',
      region: 'NA',
      discord: 'Test#143',
    },
    {
      name: 'Azuru',
      role: 'Mid',
      rank: 'Platinum 2',
      region: 'NA',
      discord: 'Test#113',
    },
    {
      name: 'Cailtyn Bot',
      role: 'ADC',
      rank: 'Challenger',
      region: 'NA',
      discord: 'Test#11123',
    },
    {
      name: 'EloInflatedYummiOTP',
      role: 'Support',
      rank: 'Platinum 1',
      region: 'NA',
      discord: 'Test#222',
    },
  ];

  const teamTwoPlayers = [...roles].map((role, index) => ({
    name: faker.name.firstName(),
    role: role,
    rank: sample(ranks),
    region: 'NA',
    discord: `${faker.name.firstName()}#1${index}3`,
  }));

  const scrims = [
    {
      lobbyName: 'testScrim 1',
      teamOne: teamOnePlayers,
      teamTwo: teamTwoPlayers,
      casters: ['jimmy', 'bob'],
      gameStartTime: setHours(new Date(), '3:00pm'),
      lobbyHost: sample([...teamOnePlayers, ...teamTwoPlayers]),
      createdBy: teamOnePlayers[0],
    },

    {
      lobbyName: 'testScrim 2',
      region: 'EUW',
      teamOne: teamOnePlayers,
      teamTwo: teamTwoPlayers,
      casters: ['YummiFan', 'AurelionSolNerfPls'],
      gameStartTime: setHours(new Date(), '9:15pm'),
      lobbyHost: sample([...teamOnePlayers, ...teamTwoPlayers]),
      createdBy: teamOnePlayers[3],
    },
  ];

  await Scrim.insertMany(scrims);

  console.log(`seeded ${scrims.length} lobbies!`);
};

const run = async () => {
  await main();
  db.close();
};

run();
