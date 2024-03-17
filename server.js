const express = require('express');
const app = express();
const request = require('request');


const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore} = require('firebase-admin/firestore');

var serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const bodyparser = require("body-parser");
const port = process.env.PORT||3000;

app.set('view engine','ejs');

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }));

app.get('/signin',(req,res)=>{
    res.render("signin");
})

app.post('/signin',(req,res)=>{
  const email = req.body.email;
    const password = req.body.psw;
    db.collection("401_users")
     .where("email","==",email)
     .where("password","==",password)
     .get()
     .then((docs)=>{
        if(docs.size>0){
            docs.forEach(doc=>{
                res.redirect("/home")
            })
        }
        else{
            res.end("Invalid email or password")
        }
    })
})


app.get("/signup", (req, res) => {
  res.render("signup");
});

 app.post('/signup',(req,res)=>{
  const email = req.body.email;
  const password = req.body.psw;
        db.collection("401_users").add({
         "email": email,
          "password": password
                }).then(() => {
                     res.render("signin");
                });
             }
 )

 app.get('/home',(req,res)=>{
  res.render("home");
})


const cd = [];

app.post('/celebdata', (req, res) => {
  const n = req.body.celebname;
  cd.length = 0;

  request.get({
      url: 'https://api.api-ninjas.com/v1/celebrity?name=' + n,
      headers: {
          'X-Api-Key': 'ySm+52uMjsdLS2hYSwHAHQ==jWmQCH1BfTAnJtdK'
      },
  }, function (error, response, body) {
      var obj = JSON.parse(body);
      if (error) {
          console.error('Request failed:', error);
          res.status(500).send('Request failed');
      } else if (response.statusCode != 200) {
          console.error('Error:', response.statusCode, body.toString('utf8'));
          res.status(response.statusCode).send('Error: ' + response.statusCode);
      } else {
          if (obj && obj.length > 0) {
              var x = obj[0];
              for (var i in x) {
                  cd.push(x[i]);
              }
              console.log(cd);
              res.render('celeb', { cd: cd }); 
          } else {
              res.send("NO celebrity found");
          }
      }
  });
});




app.listen(port,()=>{
  console.log("Listening on http:localhost:3000")
});
 