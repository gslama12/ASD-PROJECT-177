# Server Documentation

## Socket Events Documentation

On success, requests are always responded in the form:
```json
{
    "data": {
        "...": "..."
    }
}
```
On error, requests are always responded in the form:
```json
{
    "error": {
        "message": "..."
    }
}
```

**Notes**
- ~~Multiplayer is currently not supported.~~ Multiplayer is supported now. [quiz-get-next-question](#quiz-get-next-question) does **not** support multiplayer.
- ~~Right now, the `playerId` is hardcoded on the server ("PlayerId"). The server code has to be updated depending on how `playerId` is passed in the future.~~ `playerId` is sent from client-side now.
- Error messages are quite vague and have no status code. This may change in the future.
- ~~As of now, game data is not stored in the database. After server restart, all data is gone.~~ Not sure about the status quo.
- Answers are passed as strings and not IDs. If that is an issue, please let us know. Unfortunately, [Trivia API](https://opentdb.com/api.php?amount=10&difficulty=easy&type=multiple) doesn't assign IDs to questions and answers.


### Quiz Game Events

| Events                                                      |
|-------------------------------------------------------------|
| [quiz-new-single-player-game](#quiz-new-single-player-game) |
| [quiz-join-multiplayer-queue](#quiz-join-multiplayer-queue) |
| [quiz-new-multiplayer-game](#quiz-new-multiplayer-game)     |
| [quiz-get-next-question](#quiz-get-next-question)           |
| [quiz-answer-question](#quiz-answer-question)               |
| [quiz-get-game-options](#quiz-get-game-options)             |
| [quiz-get-game-info](#quiz-get-game-info)                   |
| [quiz-game-complete](#quiz-get-game-info)                   |
| [quiz-get-game-stats](#quiz-get-game-info)                  |
| [quiz-get-user-games](#quiz-get-game-info)                  |

### Game Steps

The following example shows in which order events are to be called to play games.

#### Single Player
1) Call [quiz-get-game-options](#quiz-get-game-options) to get all available game options.
2) Call [quiz-new-single-player-game](#quiz-new-single-player-game) with the desired options to create a new game. `gameId` needs to be used in other calls.
3) Call [quiz-answer-question](#quiz-answer-question) with the `answer`, `gameId` and `userId`. Sends all information, including the solution as well as next question.
4) ~~If [quiz-answer-question](#quiz-answer-question) fails, a new question can be retrieved via [quiz-get-next-question](#quiz-get-next-question).~~ Potentially buggy right now.
5) A game is over once the server emits the event `quiz-game-complete`. It can also be checked via `response.data.gameInfo.gameComplete`.
6) [quiz-get-game-info](#quiz-get-game-info) can be called via `gameId` at any time to get all information about a game.

#### Multiplayer
1) Call [quiz-get-game-options](#quiz-get-game-options) to get all available game options.
2) Call [quiz-join-multiplayer-queue](#quiz-join-multiplayer-queue) with game options so that the server assigns your client to a roomId.
3) Wait until server calls `quiz-multiplayer-queue-ready` event, which signals that a matching player was found.
4) Call [quiz-new-multiplayer-game](#quiz-new-multiplayer-game) with `playerId` and `roomId` to join the multiplayer game. Once all clients called this event, they receive the first question simultaneously. Note that `gameId` needs to be used in other calls.
5) Call [quiz-answer-question](#quiz-answer-question) with the `answer`, `gameId`, `userId` **and** `roomId`. Sends all information, including the solution as well as next question.
6) ~~If [quiz-answer-question](#quiz-answer-question) fails, a new question can be retrieved via [quiz-get-next-question](#quiz-get-next-question).~~ Not supported for multiplayer.
7) A game is over once the server emits the event `quiz-game-complete`. It can also be checked via `response.data.gameInfo.gameComplete`.
8) [quiz-get-game-info](#quiz-get-game-info) can be called via `gameId` at any time  to get all information about a game.

---

#### `quiz-new-single-player-game`

Creates a new quiz game and returns the first question.

Also returns `gameId`, which needs to be stored on client-side since it is used in other requests.

**Parameters**

Available options can be retrieved via [quiz-get-game-options](#quiz-get-game-options).

| Name       | Type   | Description                                                                                            |
|------------|--------|--------------------------------------------------------------------------------------------------------|
| gameMode   | string | Select the game mode. `multiple` for multiple choice (4 options, 1 correct), `boolean` for true/false. |
| difficulty | string | Select difficulty: `easy`, `normal` and `hard`.                                                        |
| userId     | string | The user Id.                                                                                           |


##### Example

```json
{
    "gameMode": "multiple",
    "difficulty": "easy",
    "userId": "66589f71523640d2a567e123"
}
```

**Response**
```json
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

#### `quiz-join-multiplayer-queue`

Joins multiplayer queue with the provided game settings. The server assigns the client to a `roomId` which is also used to join a new
socket connection via `socket.join(roomId);`. Once another player with matching game settings joins the queue, they receive the same
`roomId` and the queue is considered full. The final client to join the queue causes the server to emit the `quiz-multiplayer-queue-ready` 
to inform all clients within that room that they should call the `quiz-new-multiplayer-game` event next. 

- Note that it may take some time to find another player with matching game settings.
- Only 2 players can play simultaneously. 

Returns `roomId` to calling clients so that they can send it in future requests. Right now, that is only relevant for the requests
[quiz-new-multiplayer-game](#quiz-new-multiplayer-game) and [quiz-answer-question](#quiz-answer-question).

**Parameters**

Available options can be retrieved via [quiz-get-game-options](#quiz-get-game-options).

| Name       | Type   | Description                                                                                            |
|------------|--------|--------------------------------------------------------------------------------------------------------|
| gameMode   | string | Select the game mode. `multiple` for multiple choice (4 options, 1 correct), `boolean` for true/false. |
| difficulty | string | Select difficulty: `easy`, `normal` and `hard`.                                                        |
| userId | string | The user Id. |

##### Example

```json
{
    "gameMode": "multiple",
    "difficulty": "easy",
    "userId": "66589f71523640d2a567e123"
}
```

**Response**

```json
{
    "data": {
        "roomId": "e0f160ec-4b4e-46cc-8af1-842c2b2757ee"
    }
}
```

---

### `quiz-new-multiplayer-game`

Assumes you already called [quiz-join-multiplayer-queue](#quiz-join-multiplayer-queue) and received a `roomId`.

This event tells the server that you are ready to join the multiplayer game for the respective `roomId`. Once all other
clients of the same `roomId` called this event, a multiplayer game is created on server-side and all clients receive
the response simultaneously.

**Parameters**

| Name   | Type   | Description                                                           |
|--------|--------|-----------------------------------------------------------------------|
| userId | string | The user Id.                                                          |
| roomId | string | Used to link the callee to the respective queue object on the server. |

##### Example

```json
{
    "roomId": "e0f160ec-4b4e-46cc-8af1-842c2b2757ee",
    "userId": "66589f71523640d2a567e123"
}
```

**Response**

```json
{
    "data": {
        "gameInfo": {
            "gameId": "b5a14e6d-6a20-4c81-a1b3-3a9f077a6d29",
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
            },
            {
                "id": "66630ffe8bd9a4ab3a44119a",
                "score": 0
            }
        ],
        "questionAnswerHistory": [],
        "question": {
            "type": "multiple",
            "difficulty": "easy",
            "category": "Entertainment: Video Games",
            "question": "What is the protagonist&#039;s title given by the demons in DOOM (2016)?",
            "answers": [
                "Doom Guy",
                "Doom Marine",
                "Doom Reaper",
                "Doom Slayer"
            ],
            "correctAnswer": "Doom Slayer"
        }
    }
}
```

---

#### `quiz-answer-question`

Sends an answer to a question. Only works if there is an active question.

**Update:** This request is also used for multiplayer and uses the parameter `roomId`.

**Parameters**

| Name   | Type   | Description                                                     |
|--------|--------|-----------------------------------------------------------------|
| gameId | string | Unique ID assigned to a game.                                   |
| answer | string | The user's answer to the current question.                      |
| userId | string | The user Id.                                                    |
| roomId | string | Must be sent if multiplayer game. Irrelevant for single player. |

##### Example (Single Player)

```json
{
    "gameId": "31acbb25-e54e-4d1c-b796-ceee664ea6d4",
    "answer": "Mary Shelley",
    "userId": "66589f71523640d2a567e123"
}
```

**Response**
```json
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
                "...": "..."
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

##### Example Multiplayer

```json
{
    "gameId": "b5a14e6d-6a20-4c81-a1b3-3a9f077a6d29",
    "answer": "Doom Guy",
    "userId": "66630ffe8bd9a4ab3a44119a",
    "roomId": "e0f160ec-4b4e-46cc-8af1-842c2b2757ee"
}
```

**Response**

```json
{
    "data": {
        "gameInfo": {
            "gameId": "b5a14e6d-6a20-4c81-a1b3-3a9f077a6d29",
            "gameComplete": false,
            "numOfRounds": 10,
            "currentRound": 2,
            "correctAnswers": 1,
            "wrongAnswers": 1
        },
        "players": [
            {
                "id": "66589f71523640d2a567e123",
                "score": 1,
                "answer": "Doom Slayer",
                "isCorrectAnswer": true
            },
            {
                "id": "66630ffe8bd9a4ab3a44119a",
                "score": 0,
                "answer": "Doom Guy",
                "isCorrectAnswer": false,
                "correctAnswer": "Doom Slayer"
            }
        ],
        "questionAnswerHistory": [
            {
                "question": {
                    "type": "multiple",
                    "difficulty": "easy",
                    "category": "Entertainment: Video Games",
                    "question": "What is the protagonist&#039;s title given by the demons in DOOM (2016)?",
                    "answers": [
                        "Doom Guy",
                        "Doom Marine",
                        "Doom Reaper",
                        "Doom Slayer"
                    ],
                    "correctAnswer": "Doom Slayer"
                },
                "playerId": "66589f71523640d2a567e123",
                "answer": "Doom Slayer",
                "isCorrect": true
            },
            {
                "question": {
                    "type": "multiple",
                    "difficulty": "easy",
                    "category": "Entertainment: Video Games",
                    "question": "What is the protagonist&#039;s title given by the demons in DOOM (2016)?",
                    "answers": [
                        "Doom Guy",
                        "Doom Marine",
                        "Doom Reaper",
                        "Doom Slayer"
                    ],
                    "correctAnswer": "Doom Slayer"
                },
                "playerId": "66630ffe8bd9a4ab3a44119a",
                "answer": "Doom Guy",
                "isCorrect": false
            }
        ],
        "question": {
            "type": "multiple",
            "difficulty": "easy",
            "category": "Entertainment: Video Games",
            "question": "Which of these levels does NOT appear in the console/PC versions of the game &quot;Sonic Generations&quot;?",
            "answers": [
                "City Escape",
                "Planet Wisp",
                "Sky Sanctuary",
                "Mushroom Hill"
            ],
            "correctAnswer": "Mushroom Hill"
        }
    }
}
```

---

#### `quiz-get-next-question`
**Obsolete request:** Should only ever be used if [quiz-answer-question](#quiz-answer-question) fails (edge case), and even then there may be a better solution.
This request does **not** support multiplayer.

Sends the next question. Only works if the current question has been answered and the game is not completed (`"gameComplete": false`).

**Parameters**

| Name   | Type   | Description                   |
|--------|--------|-------------------------------|
| gameId | string | Unique ID assigned to a game. |

##### Example

```json
{
    "gameId": "31acbb25-e54e-4d1c-b796-ceee664ea6d4"
}
```

**Response**

```json
{
    "data": {
        "...": "..."
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

```json
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
            {
              "...": "..."
            },
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

```json
{
    "gameId": "5efa9c51-a145-4a3e-83a5-6159fe7ad351"
}
```

**Response**

```json
{
    "data": {
        "gameInfo": {
            "gameId": "b5a14e6d-6a20-4c81-a1b3-3a9f077a6d29",
            "gameComplete": true,
            "numOfRounds": 10,
            "currentRound": 10,
            "correctAnswers": 1,
            "wrongAnswers": 19
        },
        "players": [
            {
                "id": "66589f71523640d2a567e123",
                "score": 1
            },
            {
                "id": "66630ffe8bd9a4ab3a44119a",
                "score": 0
            }
        ],
        "questionAnswerHistory": [
            {
                "question": {
                    "type": "multiple",
                    "difficulty": "easy",
                    "category": "Entertainment: Video Games",
                    "question": "What is the protagonist&#039;s title given by the demons in DOOM (2016)?",
                    "answers": [
                        "Doom Guy",
                        "Doom Marine",
                        "Doom Reaper",
                        "Doom Slayer"
                    ],
                    "correctAnswer": "Doom Slayer"
                },
                "playerId": "66589f71523640d2a567e123",
                "answer": "Doom Slayer",
                "isCorrect": true
            },
            {
                "question": {
                    "type": "multiple",
                    "difficulty": "easy",
                    "category": "Entertainment: Video Games",
                    "question": "What is the protagonist&#039;s title given by the demons in DOOM (2016)?",
                    "answers": [
                        "Doom Guy",
                        "Doom Marine",
                        "Doom Reaper",
                        "Doom Slayer"
                    ],
                    "correctAnswer": "Doom Slayer"
                },
                "playerId": "66630ffe8bd9a4ab3a44119a",
                "answer": "Doom Guy",
                "isCorrect": false
            },
			{
				"...": "..."
			}
        ]
    }
}
```

**Note:** If there is no question (e.g. when `"gameComplete": true`), the `question` property is omitted.

---

### quiz-game-complete
This event is triggered when the game completes. It emits the final game statistics to all players involved in the game. The event is internally triggered within the `ANSWER_QUESTION` event.

**Response:** (outdated information)
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

**Multiplayer Response:**
```json
{
    "data": {
        "gameInfo": {
            "gameId": "b5a14e6d-6a20-4c81-a1b3-3a9f077a6d29",
            "gameComplete": true,
            "numOfRounds": 10,
            "currentRound": 10,
            "correctAnswers": 1,
            "wrongAnswers": 19
        },
        "players": [
            {
                "id": "66589f71523640d2a567e123",
                "score": 1,
                "answer": "Doom Slayer",
                "isCorrectAnswer": false,
                "correctAnswer": "Germany"
            },
            {
                "id": "66630ffe8bd9a4ab3a44119a",
                "score": 0,
                "answer": "Doom Guy",
                "isCorrectAnswer": false,
                "correctAnswer": "Germany"
            }
        ],
        "questionAnswerHistory": [
            {
                "question": {
                    "type": "multiple",
                    "difficulty": "easy",
                    "category": "Entertainment: Video Games",
                    "question": "What is the protagonist&#039;s title given by the demons in DOOM (2016)?",
                    "answers": [
                        "Doom Guy",
                        "Doom Marine",
                        "Doom Reaper",
                        "Doom Slayer"
                    ],
                    "correctAnswer": "Doom Slayer"
                },
                "playerId": "66589f71523640d2a567e123",
                "answer": "Doom Slayer",
                "isCorrect": true
            },
            {
                "question": {
                    "type": "multiple",
                    "difficulty": "easy",
                    "category": "Entertainment: Video Games",
                    "question": "What is the protagonist&#039;s title given by the demons in DOOM (2016)?",
                    "answers": [
                        "Doom Guy",
                        "Doom Marine",
                        "Doom Reaper",
                        "Doom Slayer"
                    ],
                    "correctAnswer": "Doom Slayer"
                },
                "playerId": "66630ffe8bd9a4ab3a44119a",
                "answer": "Doom Guy",
                "isCorrect": false
            },
            {
              "...": "..."
            }
        ],
        "question": {
            "type": "multiple",
            "difficulty": "easy",
            "category": "Sports",
            "question": "Which team won 2014 FIFA World Cup in Brazil?",
            "answers": [
                "Argentina",
                "Brazil",
                "Netherlands",
                "Germany"
            ],
            "correctAnswer": "Germany"
        }
    }
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

**Response:** (outdated information)
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

**Response:** (potentially outdated information)
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