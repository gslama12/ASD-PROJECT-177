# Server Documentation

## Socket Events Documentation

On success, requests are always responded in the form:
```
{
    "data": {
        ...
    }
}
```
On error, requests are always responded in the form:
```
{
    "error": {
        "message": "..."
    }
}
```

**Notes**
- Multiplayer is currently not supported.
- Right now, the `playerId` is hardcoded on the server ("PlayerId"). The server code has to be updated depending
  on how `playerId` is passed in the future.
- Error messages are quite vague and have no status code. This may change in the future.
- As of now, game data is not stored in the database. After server restart, all data is gone.
- Answers are passed as strings and not IDs. If that is an issue, please let us know. Unfortunately, [Trivia API](https://opentdb.com/api.php?amount=10&difficulty=easy&type=multiple) doesn't assign IDs to questions and answers.


### Quiz Game Events

| Events                                                      |
|-------------------------------------------------------------|
| [quiz-new-single-player-game](#quiz-new-single-player-game) |
| [quiz-get-next-question](#quiz-get-next-question)           |
| [quiz-answer-question](#quiz-answer-question)               |
| [quiz-get-game-options](#quiz-get-game-options)             |
| [quiz-get-game-info](#quiz-get-game-info)                   |
| [quiz-game-complete](#quiz-get-game-info)                   |
| [quiz-get-game-stats](#quiz-get-game-info)                   |
| [quiz-get-user-games](#quiz-get-game-info)                   |

### Game Steps

The following example shows in which order events are to be called to play games.

#### Single Player
1) Call [quiz-get-game-options](#quiz-get-game-options) to get all available game options.
2) Call [quiz-new-single-player-game](#quiz-new-single-player-game) with the desired options to create a new game. `gameId` needs to be used in other calls.
3) Call [quiz-answer-question](#quiz-answer-question) with the `answer`, `gameId` and `userId`. Sends the next question.
4) If [quiz-answer-question](#quiz-answer-question) fails, a new question can be retrieved via [quiz-get-next-question](#quiz-get-next-question).
5) A game is over after the final question is answered (`gameComplete: "true"`).
6) [quiz-get-game-info](#quiz-get-game-info) can be called via `gameId` to get all information about a game.

#### Multiplayer
TODO

---

#### `quiz-new-single-player-game`

Creates a new quiz game and returns the first question. Available options can be retrieved
via [quiz-get-game-options](#quiz-get-game-options).

Also returns `gameId`, which needs to be stored on client-side since it is used in other requests.

**Parameters** <br>

| Name       | Type   | Description                                                                                            |
|------------|--------|--------------------------------------------------------------------------------------------------------|
| gameMode   | string | Select the game mode. `multiple` for multiple choice (4 options, 1 correct), `boolean` for true/false. |
| difficulty | string | Select difficulty: `easy`, `normal` and `hard`.                                                        |
| userId | string | The user Id. |


##### Example

```
{
    "gameMode": "multiple",
    "difficulty": "easy",
    "userId": "66589f71523640d2a567e123"
}
```

**Response**
```
{
    "data": {
        "gameInfo": {
            "gameId": "31acbb25-e54e-4d1c-b796-ceee664ea6d4",
            "gameComplete": false,
            "numOfRounds": 10,
            "currentRound": 1,
            "correctAnswers": 0,
            "wrongAnswers": 0
        },
        "players": [
            {
                "id": "66589f71523640d2a567e123",
                "score": 0
            }
        ],
        "questionAnswerHistory": [],
        "question": {
            "type": "multiple",
            "difficulty": "easy",
            "category": "Science &amp; Nature",
            "question": "Who is the chemical element Curium named after?",
            "answers": [
                "The Curiosity Rover",
                "Curious George",
                "Stephen Curry",
                "Marie &amp; Pierre Curie"
            ],
            "correctAnswer": "Marie &amp; Pierre Curie"
        }
    }
}
```

---

#### `quiz-answer-question`

Sends an answer to a question. Only works if there is an active question.

**Parameters**

| Name   | Type   | Description                             |
|--------|--------|-----------------------------------------|
| gameId | string | Unique ID assigned to a game.           |
| answer | string | The user's answer to the current question. |
| userId | string | The user Id. |

##### Example

```
{
    "gameId": "31acbb25-e54e-4d1c-b796-ceee664ea6d4",
    "answer": "Mary Shelley",
    "userId": "66589f71523640d2a567e123"
}
```

**Response**
```
{
    "data": {
        "gameInfo": {
            "gameId": "31acbb25-e54e-4d1c-b796-ceee664ea6d4",
            "gameComplete": false,
            "numOfRounds": 10,
            "currentRound": 3,
            "correctAnswers": 2,
            "wrongAnswers": 0
        },
        "players": [
            {
                "id": "66589f71523640d2a567e123",
                "score": 2,
                "answer": "Mary Shelley",
                "isCorrectAnswer": true
            }
        ],
        "questionAnswerHistory": [
            {
                ...
            },
            {
                "question": {
                    "type": "multiple",
                    "difficulty": "easy",
                    "category": "Entertainment: Books",
                    "question": "Who was the original author of Frankenstein?",
                    "answers": [
                        "Edgar Allan Poe",
                        "Bram Stoker",
                        "H. P. Lovecraft",
                        "Mary Shelley"
                    ],
                    "correctAnswer": "Mary Shelley"
                },
                "playerId": "66589f71523640d2a567e123",
                "answer": "Mary Shelley",
                "isCorrect": true
            }
        ],
        "question": {
            "type": "multiple",
            "difficulty": "easy",
            "category": "Science &amp; Nature",
            "question": "What lies at the center of our galaxy?",
            "answers": [
                "A wormhole",
                "A supernova",
                "A quasar",
                "A black hole"
            ],
            "correctAnswer": "A black hole"
        }
    }
}
```

---

#### `quiz-get-next-question`
**Obsolete request:** Should only ever be used if [quiz-answer-question](#quiz-answer-question) fails (edge case), and even then there may be a better solution.

Sends the next question. Only works if the current question has been answered and the game is not completed (`"gameComplete": false`).

**Parameters**

| Name   | Type   | Description                   |
|--------|--------|-------------------------------|
| gameId | string | Unique ID assigned to a game. |

##### Example

```
{
    "gameId": "31acbb25-e54e-4d1c-b796-ceee664ea6d4"
}
```

**Response**

```
{
    "data": {
        ...
    }
}
```

---

#### `quiz-get-game-options`

Retrieves the available options for creating games.

Note that only `gameModes` and `difficulties` are relevant right now, `categories` can be ignored. The reason that
`categories` should not be used is because [Trivia Database](https://opentdb.com/api_config.php) has only very few
questions for specific categories, and even fewer when `gameMode` and `difficulty` is taken into account. Doing quizzes
with few questions may lead to a bug that there are not enough questions to play a quiz.


##### Example

No parameters need to be sent.

**Response**

```
{
    "data": {
        "gameModes": [
            {
                "id": 1,
                "name": "multiple"
            },
            {
                "id": 2,
                "name": "boolean"
            }
        ],
        "categories": [
            {
                "id": 9,
                "name": "General Knowledge",
                "questionCount": 313
            },
            
            ...
            
            {
                "id": 31,
                "name": "Entertainment: Japanese Anime & Manga",
                "questionCount": 184
            }
        ],
        "difficulties": [
            {
                "id": 1,
                "name": "easy"
            },
            {
                "id": 2,
                "name": "normal"
            },
            {
                "id": 3,
                "name": "hard"
            }
        ]
    }
}
```

---

#### quiz-get-game-info

Displays all game information about a game. This includes current and total rounds, if a game is over, player information and the current question.

**Parameters**

| Name   | Type   | Description                   |
|--------|--------|-------------------------------|
| gameId | string | Unique ID assigned to a game. |

##### Example

```
{
    "gameId": "5efa9c51-a145-4a3e-83a5-6159fe7ad351"
}
```

**Response**

```
{
    "data": {
        "gameInfo": {
            "gameId": "5efa9c51-a145-4a3e-83a5-6159fe7ad351",
            "gameComplete": false,
            "numOfRounds": 10,
            "currentRound": 2
        },
        "players": [
            {
                "id": "PlayerId",
                "score": 1
            }
        ],
        "question": {
            "type": "multiple",
            "difficulty": "easy",
            "category": "General Knowledge",
            "question": "What airline was the owner of the plane that crashed off the coast of Nova Scotia in 1998?",
            "answers": [
                "Air France",
                "British Airways",
                "TWA",
                "Swiss Air"
            ],
            "correctAnswer": "Swiss Air"
        }
    }
}
```

**Note:** If there is no question (e.g. when `"gameComplete": true`), the `question` property is omitted.

---

### quiz-game-complete
This event is triggered when the game completes. It emits the final game statistics to all players involved in the game. The event is internally triggered within the `ANSWER_QUESTION` event.

**Response:**
```json
{
  "gameStats": {
    "totalQuestions": 10,
    "correctAnswers": 7,
    "gameDuration": "15 minutes",
    "playerScores": {
      "player1": {
        "score": 70,
        "correctAnswers": 7
      }
    }
  },
  "questionAnswerHistory": [
    {
      "question": "What is the capital of France?",
      "correctAnswer": "Paris",
      "playerAnswers": {
        "player1": "Paris"
      }
    }
  ]
}
```

---


### quiz-get-game-stats
This event retrieves the statistics of a specific game by its game ID from the DB.

**Request:**
```json
{
  "gameId": "unique_game_id"
}
```

**Response:**
```json
{
  "gameId": "unique_game_id",
  "totalQuestions": 10,
  "correctAnswers": 7,
  "gameDuration": "15 minutes",
  "playerScores": {
    "player1": {
      "score": 70,
      "correctAnswers": 7
    }
  }
}
```

---

### quiz-get-user-games
This event is used to fetch all games played by a specific user fro mthe db. It is intended for use in a post game history display.

**Request:**
```json
{
  "username": "player_username"
}
```

**Response:**
```json
{
  "games": [
    {
      "gameId": "game1",
      "date": "2023-05-20",
      "result": "Won",
      "score": 80
    },
    {
      "gameId": "game2",
      "date": "2023-05-21",
      "result": "Lost",
      "score": 45
    }
  ]
}
```