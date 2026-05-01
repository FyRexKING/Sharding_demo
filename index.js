const express=require('express');
const app=express();
const {Client}=require('pg');
const crypto=require('crypto');
const HashRing=require('hashring');
app.use(express.json());
const hr=new HashRing();
hr.add("5432");
hr.add("5433");
hr.add("5434");

const clients={
    "5432":new Client({
        host:"localhost",
        port:5432,
        user:"postgres",
        password:"postgres",
        database:"shard_db"
        }),
    "5433":new Client({
        host:"localhost",
        port:5433,
        user:"postgres",
        password:"postgres",
        database:"shard_db"
        }),
    "5434":new Client({
        host:"localhost",
        port:5434,
        user:"postgres",
        password:"postgres",
        database:"shard_db"
        })
};
async function connect(){
    try{
    await clients["5432"].connect();
    await clients["5433"].connect();
    await clients["5434"].connect();
    console.log("connected");
    }
    catch(e){
        console.error("Error connecting to distributed shards",e);
        process.exit(1);
    }
}
connect();
function getShard(userId){
    return hr.get(userId.toString());
}
app.post('/users',async(req,res)=>{
    try{
        const userId=req.body.userId || req.body.user_id;
        const {name,email}=req.body;
        if(!userId || !name || !email){
            return res.status(400).json({error:"Missing required fields"});
        }
        const shard=getShard(userId);
        const client=clients[shard];
        console.log("Routing insert to shard",shard);
        await client.query('INSERT INTO users (user_id,name,email) VALUES ($1,$2,$3)',[userId,name,email]);
        res.status(201).json({message:"User created successfully"});
    }
    catch(err){
        console.error(err);
        if(err.code==="23505"){
            return res.status(409).send("Duplicate userID");
        }
        return res.status(500).send("Insert Failed");
    }
});
app.get("/users/:id",async(req,res)=>{
    try{
        const userId=parseInt(req.params.id);
        const shard=getShard(userId);
        if(req.query.explain==="true"){
            const explain=await clients[shard].query(`EXPLAIN ANALYZE SELECT * FROM users WHERE user_id=$1`,[userId]);
            return res.send({
                shard,explain:explain.rows.map(row=>row['QUERY PLAN'])
            });
        }
        const result=await clients[shard].query('SELECT * FROM users WHERE user_id=$1',[userId]);
        if(result.rowCount===0){
            return res.status(404).send("User not found");
        }
        res.send({
            user:result.rows[0],shard
        })
    }
    catch(err){
        console.error(err);
        return res.status(500).send("Query Failed");
    }
});
app.listen(3000,()=>{
    console.log("Server running on port 3000");
});