# Fantasy Cricket API

## Introduction

This API provides endpoints for managing fantasy cricket teams, processing match results, and viewing team standings.

## Endpoints

### Add Team Entry "/add-team"

This endpoint allows app users to submit new team entries. It validates player selection rules and requires the following input parameters:

- Your Team Name (required)
- Players [] (required, list of player names)
- Captain (required, player name)
- Vice-captain (required, player name)

**Request Body Example:**
```json
{
  "teamName": "Your Team Name4",
  "players": ["Player 1", "Player 2","Player 3","Player 4","Player 5","Player 6","Player 7","Player 8","Player 9","Player 10", "Player 11"],
  "captain": "Player 2",
  "viceCaptain": "Player 1"
}

Process Match Result "/process-result"
This endpoint processes match results, calculates points for players, and assigns them to the team entries with those players. The results are processed using data from match.json for the CSKvRR 2022 match.

### Input Parameters:
None

### View Teams Results "/team-result"
This endpoint allows users to view the list of team entries with their scored points and total points. The top team with the maximum points is shown as the winner. If multiple teams have the top score, all winning teams are displayed.

### Input Parameters:

None (show results for CSKvRR 2022)



# TASK

Write a simple backend to accept team entries for a fantasy cricket app (similar to Dream11) and process the results based on match results. Use Node.js backend with express for API and MongoDB for database. Core packages are pre-installed with a dev database connection to MongoDB Atlas. You are free to add additional libraries for validation, etc.


## Tech Stack 
- Node.js with Express
- Database 
  - MongoDB 
  - DB Name: "task-"


## Data

Players: 
--
- There are CSV and JSON files under data folder for players list
- This contains list of all players in two teams (RR and CSK 2022)
- This is the list from which players can be chosen for team entry 

Match: 
--
- There are CSV and JSON files under data folder for match result
- This contains ball by ball results of the match (RR and CSK 2022)
- This should be used for result generation and points calculation for team entries 



## Rules

Every cricket team entry must have 11 players
A maximum of 10 players can be selected from any one of the teams

Min & Max Players in a team
--
Player 				    Type	Min	Max
Wicket Keeper 	 	WK		1	  8
Batter	 			    BAT		1	  8
All Rounder			  AR		1	  8
Bowler				    BWL		1	  8

Once you have selected your 11 players, you will have to assign a captain and vice-captain for your team
The captain will give you 2x points scored by them in the actual match.
The vice-captain will give you 1.5x points scored by them in the actual match.

Batting Points
--
Run						        +1
Boundary Bonus			  +1
Six Bonus				      +2
30 Run Bonus			    +4
Half-century Bonus	  +8
Century Bonus			    +16
Dismissal for a duck 	-2 (Batter, Wicket-Keeper & All-Rounder only)


Bowling Points
--
Wicket (Excluding Run Out)	+25
Bonus (LBW / Bowled)		    +8
3 Wicket Bonus				      +4
4 Wicket Bonus				      +8
5 Wicket Bonus				      +16
Maiden Over					        +12


Fielding Points
--
Catch						    +8
3 Catch Bonus				+4
Stumping					  +12
Run out 	          +6




## Endpoints

### Add Team Entry "/add-team"
- App users can use this endpoint to submit new team entries
- Validate for player selection rules as above
- Input Parameters:
  - Your Team Name (required)
  - Players [] (required, list of player names)
  - Captain (required, player name) 
  - vice-captain (required, player name)


### Process Match Result "/process-result"
  - Run this endpoint to process match result
  - This should calculate points for the players and assign it to the team entries with those players
  - Input Parameters:
    - None, the resuls will be processed using data/match.json for CSKvRR 2022


### View Teams Results "/team-result"
  - To view the list of team entries with thier scored points and the team's total points
  - The top team with maximum points should be shown as winner
  - If multiple teams have the top score, show all the winning teams
  - Input Parameters:
    - None, show results for CSKvRR 2022



    # Fantasy Cricket API

## Introduction

This API provides endpoints for managing fantasy cricket teams, processing match results, and viewing team standings.

## Endpoints

### Add Team Entry "/add-team"

This endpoint allows app users to submit new team entries. It validates player selection rules and requires the following input parameters:

- Your Team Name (required)
- Players [] (required, list of player names)
- Captain (required, player name)
- Vice-captain (required, player name)

**Request Body Example:**
```json
{
  "teamName": "Your Team Name4",
  "players": ["Player 1", "Player 2","Player 3","Player 4","Player 5","Player 6","Player 7","Player 8","Player 9","Player 10", "Player 11"],
  "captain": "Player 2",
  "viceCaptain": "Player 1"
}
