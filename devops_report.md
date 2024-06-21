# Report
### DevOps: Besjana Jacaj

## Layout
- What the plan was
    - Implement **CI** (continuous integration)
        - linting
        - building
        - testing
    - Implement **CD** (continuous delivery)
        - deploy to cloud
        - integrate gitlab so that merges triggered deployment

## Implementation
First of all, I would like to restate that the tech stack of this full stack application is ExpressJS (serverside) and React (clientside), alongside mongodb (database).

I initially added *linting* for the **clientside**.

Then I spent a <u>lot of time</u> trying to figure out how to make the build stage work. The __problem__ was that we use a cloud database and everytime a connection is created it requires that the IP adress of the machine that initiated the request is part of the IP access list.

What I did was :
- create an ATLAS_KEY (in order to communicate with the provider's API  using the CLI)
- wrote a script which takes the IP of the current running instance of GitLab 
- this IP is added to the access list via a call to this endpoint : `$ATLAS_API_URL/groups/$ATLAS_PROJECT_ID/accessList`
- after adding the IP I start the build of the application
- after build ends successfully I start the cleanup stage which involves another call to a DELETE endpoint in order to delete the IP added.


I did not implement any testing in the pipeline. 

Regarding deployment, I initially went for the most popular solution being AWS. 
But then I google for some more lightweight solution and I saw that Vercel was perfect for deploying frontend applications, and so I tried, but did not complete the deployment fo the entire application since the serverside is not properly deployed.

I have attached an url which will take you to the frontend part of the application. Behind the scenes (a.k.a in the console/dev tools) you can notice that it fails to connect to the server for obvious reasons).
Another thing to notice is that if you try to refresh the page it will throw an error precisely because the route (/login) requires that it is connected to the server.

https://client-phi-nine.vercel.app

## Results

- What I achieved
    - linting
    - building
    - partial deployment
- What I did not achieve:
    - testing
    - "full" deployment
    - integration with git for the deployment provider (Vercel in this case)

