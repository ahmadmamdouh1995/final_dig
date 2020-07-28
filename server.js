require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverRide = require('method-override');

const app = express();
const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL);


//useful express codes
app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(methodOverRide('_method'));

// listining to port 

client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`I listining to PORT ${PORT}`)
        })
    })

// Routs 
app.get('/', homeHandler);
app.get('/fav',favHandler);
app.get('/selectData',selectDataHandler);
app.get('/details/:digi_id',detailsHandler);
app.put('/update/:id',updateHandler);
app.delete('/delete/:id',deleteHandler)


//Handlers 

function homeHandler(req, res) {
    let url = 'https://digimon-api.vercel.app/api/digimon'
    superagent.get(url)
    .then(data=>{
        let digArry = data.body.map(val=>{
            return new Dig(val)
        })
        res.render('index',{data:digArry})
    })

}

function favHandler(req,res){
    let {name , image , level} = req.query;
    let sql = `INSERT INTO final_dig (name , image , level) VALUES ($1,$2,$3);`;
    let safvalues = [name , image , level];
    client.query(sql,safvalues)
    .then(()=>{
        res.redirect('/selectData')
    })

}

function selectDataHandler (req,res){
    let sql = `SELECT * FROM final_dig;`;
    client.query(sql)
    .then(result=>{
        res.render('pages/fav' , {data : result.rows})
    })
}

function detailsHandler(req,res){
    let param = req.params.digi_id;
    let sql = `SELECT * FROM final_dig WHERE id = $1;`;
    let safeValues = [param];
    client.query(sql,safeValues)
    .then(result=>{
        res.render('pages/details',{data : result.rows[0]})
    })
}

function updateHandler(req,res){
    let param = req.params.id;
    let {name , image , level}= req.body;
    let sql = `UPDATE final_dig SET name=$1 , image=$2 , level=$3 WHERE id=$4;`;
    let safeValues = [name , image , level ,param] ;
    client.query(sql,safeValues)
    .then(()=>{
        res.redirect(`/details/${param}`);
    })

}

function deleteHandler(req,res){
    let param = req.params.id;
    let sql =`DELETE FROM final_dig WHERE id=$1;`;
    let safeValues = [param];
    client.query(sql,safeValues)
    .then(()=>{
        res.redirect('/selectData');
    })
}






function Dig(val){
    this.name = val.name || 'no name';
    this.image = val.img || 'no image';
    this.level = val.level || 'no level';
}


// errors Handler

function notFoundHandler(req, res) {
    res.status(404).send('PAGE NOT FOUND !!');
}

function errorHandler(err, req, res) {
    res.status(500).send(err)
}