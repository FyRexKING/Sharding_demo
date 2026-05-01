So just completed the sharding part from Hussien nasser course  and was well fascinated by the idea of why not to shard...Opened my mind pretty much and after seeing a lot of examples on over engineering by sharding perhaps It is a good time to actually impelement a mini scale sharding system'.

Lets take into consideration using the techstack of the project:
Node.js
Postgres
Docker

So will spin up a docker conatiner for each shard and lets use docker-compose to orchestrate the containers perhaps i can ideally recreate the entire container setup in a single docker compose file

1st May:-
So basically implemented a basic shard routing system using hash rings and I guess as we have used UserId in the schema It provides a very natural shard key for use.So happy to see this version working

Next goals:-
1.So first add the init.sql script to create user table on conatiner creation itself so need not to manually create the table with schema on each container
2.So next add the docker-compose file to create the containers and run the init.sql script on each container
3.Probably would be interested to implement a basic shard manager to manage the shards and routing to appropriate shard something like vitess for mysql 
4.Load balancing is not something quite significant right now as I have not yet simulated any load on the system to break under load .Looking forward to break this and fail it under scale
