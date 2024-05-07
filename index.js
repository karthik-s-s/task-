const express = require('express');
const app = express();
require('dotenv').config();
const port = 3000;


// Database Details
const DB_USER = process.env['DB_USER'];
const DB_PWD = process.env['DB_PWD'];
const DB_URL = process.env['DB_URL'];
const DB_NAME = process.env.DB_NAME;
//const DB_COLLECTION_NAME = 'players';


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri =  process.env.URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function run() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });

    db = client.db(DB_NAME);

    console.log('You successfully connected to MongoDB!');
  } finally {
  }
}

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sample create document
async function sampleCreate() {
  const demo_doc = {
    demo: 'doc demo',
    hello: 'world',
  };
  const demo_create = await db
    .collection(DB_COLLECTION_NAME)
    .insertOne(demo_doc);

  console.log('Added!');
  console.log(demo_create.insertedId);
}

//functions
let addTeam = async (req, res) => {
  try {
    const { teamName, players, captain, viceCaptain } = req.body;

    // To Check if all fields are provided
    if (!teamName || !players || !captain || !viceCaptain) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // To check player count
    if (players.length !== 11) {
      return res.status(400).json({ message: '11 players are required' });
    }

    // Check if captain and vice-captain are included in players list
    if (!players.includes(captain) || !players.includes(viceCaptain)) {
      return res
        .status(400)
        .json({
          message: 'Captain and vice-captain must be among selected players',
        });
    }

    // Check if each player is selected only once
    const duplicatePlayers = new Set(
      players.filter((player, index) => players.indexOf(player) !== index)
    );
    if (duplicatePlayers.size > 0) {
      return res
        .status(400)
        .json({ message: 'Each player should be selected only once' });
    }

    // Save team entry to MongoDB
    const teamsCollection = db.collection('teams');
    const result = await teamsCollection.insertOne({
      teamName,
      players,
      captain,
      viceCaptain,
    });
    if (result.insertedId) {
      return res.status(201).json({ message: 'Added successfully' });
    } else {
      return res.status(500).json({ message: 'Oops failed to add' });
    }
  } catch (error) {
    console.error('Error adding team:', error);
    return res.status(500).json({ message: 'error' });
  }
};

// Function to calculate batting points
function calculateBattingPoints(runs, boundaries, sixes, isDuck) {
  let points = runs;

  if (runs >= 30) {
    points += 4;
  }

  if (runs >= 50) {
    points += 8;
  }

  if (runs >= 100) {
    points += 16;
  }

  if (isDuck) {
      points -= 2;
  }
  return points;
}

// Function to calculate points for bowling
function calculateBowlingPoints(wickets, bonuses, maidens) {
  let points = wickets * 25 + bonuses * 8;

  if (wickets >= 3) {
    points += 4;
  }

  if (wickets >= 4) {
    points += 8;
  }

  if (wickets >= 5) {
    points += 16;
  }

  points += maidens * 12;

  return points;
}

// Function to calculate points for fielding
function calculateFieldingPoints(catches, stumpings, runOuts) {
  let points = catches * 8 + stumpings * 12 + runOuts * 6;

  if (catches >= 3) {
    points += 4;
  }

  return points;
}

// Function to calculate total points for a player in a match
function calculatePlayerPoints(matchData, role) {
  let points = 0;

  if (role === 'BATTER') {
    //giving sixes and boundry as  0 since the db does not provide info about that
    points += calculateBattingPoints(
      matchData.batsman_run,
      0,
      0,
      matchData.batsman_run === 0
    );
  } else if (role === 'BOWLER') {
    points += calculateBowlingPoints(
      matchData.isWicketDelivery === 1 ? 1 : 0,
      matchData.kind === 'lbw' || matchData.kind === 'bowled' ? 1 : 0,
      matchData.kind === 'maidens' ? 1 : 0
    );
  } else if (role === 'WICKETKEEPER' || 'ALL-ROUNDER') {
    points += calculateFieldingPoints(
      matchData.kind === 'caught' ? 1 : 0,
      matchData.kind === 'stumped' ? 1 : 0,
      matchData.kind === 'run out' ? 1 : 0
    );
  }
  return points;
}

// Function to update total points for a team in the database
async function updateTeamTotalPoints(teamName, totalPoints) {
  const teamsCollection = db.collection('teams');

  try {
    await teamsCollection.updateOne(
      { teamName: teamName },
      { $set: { totalPoints: totalPoints } }
    );
  } catch (error) {
    console.error(`Error updating total points for team ${teamName}: ${error}`);
  }
}

// Function to calculate and update total points for all players in a team
async function calculateAndUpdateTeamPoints(teamData) {
  const playersData = teamData.players;

  let totalTeamPoints = 0;
  //console.table(playersData)

  for (const player of playersData) {
    // Fetch match data for the player batter bowler fielders_involved
    const matchData = await db.collection('match').findOne({
      $or: [
        { batter: player },
        { bowler: player },
        { fielders_involved: player },
      ],
    });
    //console.table(matchData)
    const teamPlayers = await db
      .collection('players')
      .findOne({ Player: player });

    if (matchData) {
      // Calculate total points for the player based on their role
      const playerPoints = calculatePlayerPoints(matchData, teamPlayers.Role);

      // Add player's points to the team's total points
      totalTeamPoints += playerPoints;
    }
  }

  // Update total points for the team in the database
  await updateTeamTotalPoints(teamData.teamName, totalTeamPoints);
}

//end

// Endpoints

app.get('/', async (req, res) => {
  res.send('Hello World!');
});

app.get('/demo', async (req, res) => {
  await sampleCreate();
  res.send({ status: 1, message: 'demo' });
});

app.post('/add-team', async (req, res) => {
  await addTeam(req, res);
});

app.post('/process-result', async (req, res) => {
  // Fetch all teams data from the database
  const teamsData = await db.collection('teams').find({}).toArray();

  // Calculate and update total points for each team
  for (const teamData of teamsData) {
    await calculateAndUpdateTeamPoints(teamData);
  }
  res.send({ status: true, message: 'Results processed successfully.' });
});

app.get('/team-result', async (req, res) => {
  try {
    // Fetch all team entries with their scored points and the team's total points
    const teamsData = await db.collection('teams').find({}).toArray();

    // Find the maximum total points among all teams
    // Calculate the maximum total points among teams, considering missing totalPoints as 0
    const maxPoints = Math.max(
      0,
      ...teamsData.map((team) => team.totalPoints || 0)
    );

    // Filter teams with the maximum total points
    const winningTeams = teamsData.filter(
      (team) => team.totalPoints === maxPoints
    );

    // Send response with the list of team entries, scored points, and total points
    res.send({
      status: true,
      message: 'Team results retrieved successfully.',
      teams: teamsData.map((team) => ({
        teamName: team.teamName,
        scoredPoints: team.points,
        totalPoints: team.totalPoints,
      })),
      winningTeams: winningTeams.map((team) => team.teamName),
    });
  } catch (error) {
    console.error('Error retrieving team results:', error);
    res.status(500).send({ status: false, error: 'Internal Server Error' });
  }
});

//

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

run();
