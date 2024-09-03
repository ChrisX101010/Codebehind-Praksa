const fs = require('fs');

// Loading group data
const groups = JSON.parse(fs.readFileSync('groups.json'));

// Simulate a match
function simulateMatch(team1, team2) {
    const team1Score = Math.floor(Math.random() * 50) + 70;
    const team2Score = Math.floor(Math.random() * 50) + 70;

    return {
        team1,
        team2,
        team1Score,
        team2Score,
        winner: team1Score > team2Score ? team1 : team2
    };
}

// Simulate group stage
function simulateGroupStage() {
    const groupKeys = Object.keys(groups);

    let groupStandings = {};

    groupKeys.forEach(groupKey => {
        console.log(`Group ${groupKey}:`);
        const group = groups[groupKey];
        let standings = [];

        // Simulate all matches in the group
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                const match = simulateMatch(group[i], group[j]);
                console.log(`  ${match.team1.Team} (${match.team1.ISOCode}) - ${match.team2.Team} (${match.team2.ISOCode}) (${match.team1Score}:${match.team2Score})`);
                updateStandings(standings, match);
            }
        }

        standings.sort((a, b) => b.points - a.points || b.diff - a.diff || b.scored - a.scored);
        groupStandings[groupKey] = standings;
    });

    return groupStandings;
}

// Updating standings
function updateStandings(standings, match) {
    const { team1, team2, team1Score, team2Score } = match;

    [team1, team2].forEach(team => {
        let teamData = standings.find(s => s.team.ISOCode === team.ISOCode);
        if (!teamData) {
            teamData = { team, played: 0, won: 0, lost: 0, points: 0, scored: 0, conceded: 0, diff: 0 };
            standings.push(teamData);
        }

        teamData.played++;
        teamData.scored += team === team1 ? team1Score : team2Score;
        teamData.conceded += team === team1 ? team2Score : team1Score;
        teamData.diff = teamData.scored - teamData.conceded;

        if (team === match.winner) {
            teamData.won++;
            teamData.points += 2;
        } else {
            teamData.lost++;
            teamData.points += 1;
        }
    });
}

// Simulating knockout phase
function simulateKnockoutPhase(groupStandings) {
    const qualifiedTeams = [];

    Object.keys(groupStandings).forEach(groupKey => {
        qualifiedTeams.push(...groupStandings[groupKey].slice(0, 2));
    });

    const knockoutMatches = [];

    // Shuffling for the knockout phase
    const shuffledTeams = qualifiedTeams.sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffledTeams.length; i += 2) {
        knockoutMatches.push(simulateMatch(shuffledTeams[i].team, shuffledTeams[i + 1].team));
    }

    return knockoutMatches;
}

// Final group standings
function displayFinalStandings(groupStandings) {
    console.log("\nKonačan plasman u grupama:");
    Object.keys(groupStandings).forEach(groupKey => {
        console.log(`    Grupa ${groupKey} (Ime - pobede/porazi/bodovi/postignuti koševi/primljeni koševi/koš razlika):`);
        groupStandings[groupKey].forEach((team, index) => {
            console.log(`        ${index + 1}. ${team.team.Team} - ${team.won} / ${team.lost} / ${team.points} / ${team.scored} / ${team.conceded} / ${team.diff >= 0 ? '+' : ''}${team.diff}`);
        });
    });
}

// Running the tournament
function runTournament() {
    const groupStandings = simulateGroupStage();
    displayFinalStandings(groupStandings);

    const knockoutMatches = simulateKnockoutPhase(groupStandings);

    console.log("\nKnockout faza:");
    knockoutMatches.forEach(match => {
        console.log(`  ${match.team1.Team} (${match.team1.ISOCode}) - ${match.team2.Team} (${match.team2.ISOCode}) (${match.team1Score}:${match.team2Score})`);
    });
}

runTournament();
