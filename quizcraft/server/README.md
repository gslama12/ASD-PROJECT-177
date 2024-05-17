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

### Game Steps

The following example shows in which order events are to be called to play games.

1) Call [quiz-get-game-options](#quiz-get-game-options) to get all available game options.
2) Call [quiz-new-single-player-game](#quiz-new-single-player-game) with the desired options to create a new game. `gameId` needs to be used in other calls.
3) Call [quiz-answer-question](#quiz-answer-question) with the `answer` and `gameId`.
4) Call [quiz-get-next-question](#quiz-get-next-question) with `gameId` to get the next question.
5) A game is over after the final question is answered (`gameComplete: True`).
6) [quiz-get-game-info](#quiz-get-game-info) can be called via `gameId` to get all information about a game.


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

##### Example

```
{
    "gameMode": "multiple",
    "difficulty": "easy"
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
            "currentRound": 1
        },
        "players": [
            {
                "id": "PlayerId",
                "score": 0
            }
        ],
        "question": {
            "type": "multiple",
            "difficulty": "easy",
            "category": "Entertainment: Comics",
            "question": "What is the full first name of the babysitter in Calvin and Hobbes?",
            "answers": [
                "Rose",
                "Ruby",
                "Rachel",
                "Rosalyn"
            ],
            "correctAnswer": "Rosalyn"
        }
    }
}
```

---

#### `quiz-answer-question`

Sends an answer to a question. Only works if there is an active question.

**Parameters**

| Name   | Type   | Description                                |
|--------|--------|--------------------------------------------|
| gameId | string | Unique ID assigned to a game.              |
| answer | string | The user's answer to the current question. |

##### Example

```
{
    "gameId": "5efa9c51-a145-4a3e-83a5-6159fe7ad351",
    "answer": "Rosalyn"
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
            "currentRound": 1
        },
        "players": [
            {
                "id": "PlayerId",
                "score": 1,
                "answer": "Rosalyn",
                "isCorrectAnswer": true
            }
        ],
        "question": {
            "type": "multiple",
            "difficulty": "easy",
            "category": "Entertainment: Comics",
            "question": "What is the full first name of the babysitter in Calvin and Hobbes?",
            "answers": [
                "Rose",
                "Ruby",
                "Rachel",
                "Rosalyn"
            ],
            "correctAnswer": "Rosalyn"
        }
    }
}
```

---

#### `quiz-get-next-question`

Sends the next question. Only works if the current question has been answered and the game is not completed (`"gameComplete": false`).

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

---

#### `quiz-get-game-options`

Retrieves the available options for creating games. Note that only `gameModes` and `difficulties`
are relevant right now, `categories` can be ignored.


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