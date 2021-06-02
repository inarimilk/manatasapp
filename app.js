const express = require('express');
const mysql = require('mysql');
const app = express();
var today = new Date();
var month = today.getMonth()+1;

const moment = require('moment');

app.use(express.static('public'));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1QAb78DEl',
  database: 'todo_app'
});


connection.connect((err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log('success');
});



app.get('/index', (req, res) => {
  connection.query(
    'select date,target,sort,progress from target where date_format(date, "%c")=date_format(current_date,"%c")',
    (error_r, results_r) => {
        console.log(results_r);
        connection.query(
        'select time_format(start,"%H:%i") as start,time_format(end,"%H:%i") as end,todo,sort1,sort2 from todo where date_format(date, "%c%e")=date_format(current_date,"%c%e")',
        (error_c,results_c) => {
            console.log(results_c);
            res.render('index.ejs',{target: results_r, todo: results_c});
        });
    });
});
      



app.get('/goalsSelect', (req,res)=> {
    res.render('goalsSelect.ejs');
    }
    );

app.get('/goalsSelect/result',(req,res)=> {
    console.log(req.query.Month);
    connection.query(
    'select id, date_format(date, "%c") as date,target,sort,progress from target where date_format(date, "%c")=?',
    [req.query.Month],
    (error,results)=> {
        console.log(results);
        if (results[0] === undefined){
            res.redirect('/goalsSelect');
        } else{
        res.render('goals.ejs',{target: results});
    }});
});


app.get('/todoSelect', (req,res)=> {
    res.render('todoSelect.ejs');
    }
    );

app.get('/todoSelect/result',(req,res)=> {
    connection.query(
        'select date_format(date, "%c") as month, date_format(date, "%e") as day, time_format(start,"%H:%i") as start,time_format(end,"%H:%i") as end,todo,sort1,sort2,time_format(result,"%H:%i") as result,accuracy from todo where date_format(date, "%c%e")=date_format(?, "%c%e") order by start asc',
        [req.query.Date],
        (error,results) => {
            console.log(results);
            if(results[0] === undefined){
                res.redirect('/todoSelect');
            } else {
            res.render('todo.ejs',{todo: results});
            }});
});

app.get('/newGoals', (req,res)=> {
    res.render('newGoals.ejs');
})

app.post('/createGoals',(req,res)=> {
    const Month = req.body.Date;
    const goal = req.body.Goal;
    const sort = req.body.Sort;
    const progress = req.body.Progress;
    connection.query(
    'insert into target(date,target,sort,progress) values(?,?,?,?)',
    [Month, goal, sort, progress],
    (error,results) => {
        connection.query(
        'select id, date_format(date, "%c") as date,target,sort,progress from target where date_format(date, "%c")=date_format(?,"%c")',
        [Month],
        (error,results)=> {
           console.log(results);
           res.render('goals.ejs',{target: results});
    });
    }
    );
});

app.get('/newTodo', (req,res)=> {
    res.render('newTodo.ejs');
})

app.post('/createTodo',(req,res)=> {
    const Date = req.body.Date;
    const Start = req.body.Start;
    const End = req.body.End;
    const Todo = req.body.Todo;
    const Sort1 = req.body.Sort1;
    const Sort2 = req.body.Sort2;    
    const Results = req.body.Results;
    connection.query(
    'insert into todo(date,start,end,todo,sort1,sort2,result) values(?,?,?,?,?,?,?)',
    [Date,Start,End,Todo,Sort1,Sort2,Results],
    (error,results) => {
        connection.query(
        'select date_format(date, "%c") as month, date_format(date, "%e") as day, time_format(start,"%H:%i") as start,time_format(end,"%H:%i") as end,todo,sort1,sort2,time_format(result,"%H:%i") as result,accuracy from todo where date_format(date, "%c%e")=date_format(?, "%c%e") order by start asc',
        [Date],
        (error,results) => {
            console.log(results);
            res.render('todo.ejs',{todo: results});
    });
    }
    );
});


app.post('/deleteGoals/:MONTH/:ID',(req,res)=> {
    connection.query(
    'Delete from target where date_format(date, "%c")=? and id=?',
    [req.params.MONTH, req.params.ID],
    (error_t,results_t) => {
        connection.query(
        'select id, date_format(date, "%c") as date,target,sort,progress from target where date_format(date, "%c")=?',
        [req.params.MONTH],
        (error_c, results_c)=>{
             res.render('goals.ejs',{target: results_c});
        });
    });
});

app.get('/editGoals/:MONTH/:ID', (req,res)=>{
    connection.query(
        'select id, date_format(date, "%c") as date,target,sort,progress from target where date_format(date, "%c")=? and id=?',
        [req.params.MONTH, req.params.ID],
        (error, results) =>{
            res.render("editGoals.ejs", {target:results});
        });
});

app.post('/updateGoals/:MONTH/:ID',(req,res)=> {
    connection.query(
    'update target set target=?, sort=?, progress=? where date_format(date, "%c")=? and id=?',
    [req.body.Goal, req.body.Sort, req.body.Progress, req.params.MONTH, req.params.ID],
    (error_t,result_t)=>{
        console.log(error_t);
        connection.query(
        'select id, date_format(date, "%c") as date,target,sort,progress from target where date_format(date, "%c")=?',
        [req.params.MONTH],
        (error_c, results_c) =>{
            console.log(error_c);
            res.render("goals.ejs", {target:results_c});
        });
    });
});

app.post('/delete/:MONTH/:DAY/:START',(req,res)=> {
    connection.query(
    'Delete from todo where date_format(date, "%c%e")=? and time_format(start, "%H:%i")=?',
    [req.params.MONTH+req.params.DAY, req.params.START],
    (error_t,results_t) => {
        connection.query(
        'select date_format(date, "%c") as month, date_format(date, "%e") as day, time_format(start,"%H:%i") as start,time_format(end,"%H:%i") as end,todo,sort1,sort2,time_format(result,"%H:%i") as result,accuracy from todo where date_format(date, "%c%e")=? order by start asc',
        [req.params.MONTH+req.params.DAY],
        (error_c, results_c)=>{
             res.render('todo.ejs',{todo: results_c});
        });
    });
});

app.get('/edit/:MONTH/:DAY/:START', (req,res)=>{
    connection.query(
        'select date_format(date, "%c") as month, date_format(date, "%e") as day, time_format(start,"%H:%i") as start,time_format(end,"%H:%i") as end,todo,sort1,sort2,time_format(result,"%H:%i") as result,accuracy from todo where date_format(date, "%c%e")=? and time_format(start,"%H:%i")=? order by start asc',
        [req.params.MONTH+req.params.DAY, req.params.START],
        (error, results) =>{
            res.render("editTodo.ejs", {todo:results});
        });
});

app.post('/update/:MONTH/:DAY/:START',(req,res)=> {
    console.log(req.params.MONTH+req.params.DAY);
    console.log(req.body.Start);
    connection.query(
    'update todo set start=?, end=?, todo=?, sort1=?, sort2=?, result=? where date_format(date, "%c%e")=? and time_format(start,"%I:%i")=?',
    [req.body.Start, req.body.End, req.body.Todo, req.body.Sort1, req.body.Sort2, req.body.Results, req.params.MONTH+req.params.DAY, req.params.START],
    (error_t,result_t)=>{
        connection.query(
        'select date_format(date, "%c") as month, date_format(date, "%e") as day, time_format(start,"%H:%i") as start,time_format(end,"%H:%i") as end,todo,sort1,sort2,time_format(result,"%H:%i") as result,accuracy from todo where date_format(date, "%c%e")=? order by start asc',
        [req.params.MONTH+req.params.DAY],
        (error_c, results_c)=>{
             res.render('todo.ejs',{todo: results_c});
        });
    });
});


app.get('/analysis',(req,res)=> {
    res.render('analysis.ejs');
});




app.listen(process.env.PORT || 3000);