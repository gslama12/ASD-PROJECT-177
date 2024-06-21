# QUIZCRAFT

## Basic Structure
+ React.js client (front-end)
+ Node.js client (back-end)
+ Socket.io for communication between React.js and Node.js
+ MongoDB Database:
	- URL: https://cloud.mongodb.com/
	- MongoDB Account: 
		* Mail: georgslamanig@gmx.at 
		* Password: Vubpu3-muhbej-buvqat
	- DB User: 
		* Username: asd 
		+ Password:asd
+ Gmail Account:
  + username: asdproject8@gmail.com 
  + pw gugfo6-zerroZ-vopcek 
  + ap-pw (for access within intellij): kqrigykchdtupyso


## How-To Run
+ Recommended IDE: WebStorm (free with student licence)
+ Install dependencies for client and server: 
	`$cd server; npm install`
	`$cd client; npm install`
+ Run Server: `$cd server; npm start`
	- Server will run on http://localhost:3001
+ Run Client: `$cd client; npm run dev`
	 - Client will run on http://localhost:5173

## Socket Events Documentation
Socket events and examples are documented [here](quizcraft/server/README.md).

## Notes Regarding the First Release
This repo is still a WIP. Currently, the following functionality is implemented:
* Login form UI
* Quiz selection UI and navigation bar
* Question Api: implemented in the back-end, front-end is not available yet (can be tested using [Postman](https://www.postman.com)).

## Notes Regarding the Final Release
The following functionality is implemented in the final release:
* Multiplayer
* Multiple quiz modes
* Additional database functionalities
* Many small details

## Team 2 Board

[Link to ClickUp](https://app.clickup.com/9015614146/v/li/901504615180)

(In case that access is denied, please contact the PO [Tarik Spahic] via Email/Discord for permission.)

![](/first_release_team2_board.png)

## Design Document (WIP)

We used [Figma](https://www.figma.com/design/833V7UETLRnt9QnxY8c6Ri/Untitled?node-id=0%3A1&t=c9VSk8Aiu0EqZ8rs-1) as our main design document for the project, the current state is "Work in progress" since the design is constantly being iterated on and changed.

## Brainstorming Board

We used [Miro](https://miro.com/welcomeonboard/M0NBaTVpY2dHUENCUk05aEQ5cWE1WldOVHA1N2szR09IQ2liUnZMR3NMaXpaeTRhNU11dDJia2ViUzJ1REU0WHwzNDU4NzY0NTg2NzEyMjQ2NTkwfDI=?share_link_id=964747285566) as our main idea board, where we write concepts, vote and discuss potential solutions.

## DevOps Report

[DevOps Report](devops_report.md)

## Team Members
- Tobias Fuchs (Dev)
- Besjana Jaçaj (Dev-Ops)
- Dominik Kolak (Dev)
- Simon Mußbacher (Dev)
- Tamara Puzić (Scrum Master)
- Philipp Schrank (Dev)
- Georg Slamanig (DevLead)
- Tarik Spahic (Product Owner)
- Markus Strimitzer (Dev)
- Samuel Traussnig (Dev)
