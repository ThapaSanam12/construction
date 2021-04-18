const { hash } = require('bcryptjs');
const { Router } = require('express');
const path = require('path');
const jwt = require('JsonWebToken');
const bcrypt = require('bcryptjs');
const express = require('express');
const mysql = require('mysql');
const router = express.Router();


const dotenv = require('dotenv');
const { error } = require('console');
require('dotenv').config();

dotenv.config({ path: './.env'});

const db = mysql.createConnection({
    host : process.env.DATABASE_HOST,
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});


router.get('/', (req, res)=>{
res.render('index');
});

router.get('/register',(req, res)=>{
    res.render('register');
});

router.get('/login',(req, res)=>{
    res.render('login');
});

// router.get('/project',(req, res)=>{
//     res.render('project');
// });


router.get('/Aproject',(req, res)=>{
    res.render('Aproject');
});


router.get('/comments',(req, res)=>{
    res.render('comments');
});
//data of project

   router.get('/project', function (req, res, next){
    db.query('SELECT * FROM project', function(err, rows, fields){
   
       if (err) throw err;
   
    //    res.json(rows);
        res.render('project', { title: 'projectdata', projectdata: rows});
    });
   
   });

   //get project data for admin
   router.get('/editAproject', function (req, res, next){
    db.query('SELECT * FROM project', function(err, rows, fields){
   
       if (err) throw err;
   
    //    res.json(rows);
        res.render('editAproject', { title: 'projectdata', projectdata: rows});
    });
   
   });

//insert work

router.post('/Aproject', function(req, res, next){
    console.log(req.body);

    const {work, description }= req.body;

    if (!req.files || Object.keys(req.files).length === 0){
    return res.status(400).send('No files were uploaded.');
    }

var file = req.files.uploaded_image;
var img_name=file.name;

if(file.mimetype == "image/jpeg" ||file.mimetype == "image/png"||file.mimetype == "image/gif" ){
                     
  file.mv('public/images/upload_images/'+file.name, function(err) {
                 
      if (err)
        return res.status(500).send(err);

              db.query( 'INSERT INTO project SET ?', {name: work, image: img_name, description: description }, (error, results)=>{
if(error){

    console.log(error);
    db.query(sql,function(err, results){
        res.render('profile/'+result.insertId);
    });
}

else{
    console.log(results);
return res.render('Aproject', {
    message: "data inserted"
});
}  
           }) 
}) 
}
        
})    




// message or comments

router.post('/comments', function(req, res, next){
console.log(req.body);

const {name, email, message} = req.body;

db.query('INSERT INTO comments SET ?',{name: name, email: email, message: message} ,(error, results)=>{


if(error){
    console.log(error);
}
else{
    return res.render('comments', {message:"comments posted.."})
}
})
}
)

//update project data by admin

router.get('/editAproject/edit-form/:id', function(req, res, next) {
    var id = req.params.id;
    var sql = `SELECT * FROM project WHERE id=${id}`;
    db.query(sql, function(err, rows, fields) {
        res.render('updateproject', {title: 'Edit project', user: rows[0]});

    });
});

router.post('/editAproject/edit/:id', function(req, res, next) {
    var id = req.params.id;
    var name = req.body.work;
    var image = req.body.uploaded_image;
    var description = req.body.description;


    var sql = `UPDATE project SET name="${name}", image="${image}", description="${description}"
    WHERE id=${id}`;
  
    db.query(sql, function(err, result) {
      if (err) throw err;
      console.log('record updated!');
      res.redirect('/editAproject');
    })
  })

//delete project
router.get('/editAproject/delete/:id', function(req, res){
    var id = req.params.id;
    console.log(id);
    var sql = `DELETE FROM project WHERE id=${id}`;
  
    db.query(sql, function(err, result) {
      if (err) throw err;
      console.log('record deleted!');
      res.redirect('/editAproject');
})

})

//regsiter user
router.post('/register', function(req, res, next) {

    console.log(req.body);



    const {fname, email, password, passwordConfirm} = req.body;

    db.query('SELECT email FROM register WHERE email = ?', [email], async (error, results)=>
    {

        if(error){
            console.log(error);
        }
        if(results.length > 0){
            return res.render('register', {
                message: 'email is already been taken'
            })
        }
        else if(password !== passwordConfirm){
            return res.render('register',{
                message: "password do not match."
            })
        }
        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);


        db.query('INSERT INTO register SET ?', {fname: fname, email: email, password: password}, (error, results) =>
        {
         if(error)   {
             console.log(error);
         }
         else {
             return res.render('register',{
                 message: "user register"
             })
         }
        })
    })
}
)

//login user

router.post('/login',  function async (req, res){

    try{
        const { email, password} = req.body;

        if( !email || !password){
            return res.status(400).render('login', {
                message: 'please provide an email and passsword'
            })
        }
    
        db.query('SELECT * from register WHERE email = ?', [email], async(error, results) => {
            console.log(results);
            if( !results || !(await bcrypt.compare( password, results[0].password))) {
                res.status(401).render('login',{
                    message:'email or password is incorrect'
                })

            }
            else {

                const id = results[0].id;
                const token = jwt.sign({ id }, process.env.JWT_SECRET,{
                    expiresIn: process.env.JWT_EXPIRES_IN
                });
                console.log("THE TOKEN is:" + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    
                    ),
                    httpOnly: true
                }
                res.cookie('jwt', token, cookieOptions );
                res.status(200).redirect("userdata");
            }
        })
    }
    catch (error){
        console.log(error);
    }
})



//get data of user
router.get('/userdata', function (req, res, next){
    db.query('SELECT * FROM project', function(err, rows, fields){
   
       if (err) throw err;
   
    //    res.json(rows);
        res.render('userdata', { title: 'userdata', userdata: rows});
    });
   
   });


      //update form route for update
      router.get('/userdata/edit-form/:id', function(req, res, next) {
        var id = req.params.id;
        var sql = `SELECT * FROM register WHERE id=${id}`;
        db.query(sql, function(err, rows, fields) {
            res.render('edituserdata', {title: 'Edit user', user: rows[0]});
    
        });
    });
    
    router.post('/userdata/edit/:id', function(req, res, next) {
        var id = req.params.id;
        var fname = req.body.fname;
        var email = req.body.email;
        var password = req.body.password;
   
    
        var sql = `UPDATE register SET fname="${fname}", email="${email}", password="${password}" WHERE id=${id}`;
      
        db.query(sql, function(err, result) {
          if (err) throw err;
          console.log('record updated!');
          res.redirect('/userdata');
        })
      })
    

   //delete
router.get('/userdata/delete/:id', function(req, res){
    var id = req.params.id;
    console.log(id);
    var sql = `DELETE FROM register WHERE id=${id}`;
  
    db.query(sql, function(err, result) {
      if (err) throw err;
      console.log('record deleted!');
      res.redirect('/userdata');
})

})


module.exports = router;

