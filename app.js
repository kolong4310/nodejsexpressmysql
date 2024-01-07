

const express = require('express')
const ejs = require('ejs')
const app = express()
const port = 3000
let bodyParser = require('body-parser')
var session = require('express-session')


require('dotenv').config()
const mysql = require('mysql2')
const connection = mysql.createConnection(process.env.DATABASE_URL)
console.log('Connected to PlanetScale!')


connection.query("SET time_zone='Asia/Seoul'");

app.set('view engine','ejs')
app.set('views','./views')

//bodyparse
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/public'))


//express session
app.use(session({ secret: 'kolong4310', cookie: { maxAge: 60000 }, resave:true , saveUninitialized :true,}))


//res.local
app.use(function (req, res, next) {

  res.locals.user_id="";
  res.locals.name="";

  if(req.session.member){
    res.locals.user_id = req.session.member.user_id
    res.locals.name = req.session.member.name
  }

  next()
})


//라우팅
app.get('/', (req, res) => {

  console.log(req.session.member);
  res.render('index')
})



app.get('/profile', (req, res) => {
    res.render('profile')
})
  
app.get('/map', (req, res) => {
    res.render('map')
})
  
app.get('/contact', (req, res) => {
    res.render('contact')
})


app.post('/contactProc', (req, res) => {
    //get방식은 query 로 req.query.name , post는 body로
    const name = req.body.name;
    // const name = req.query.name;
    const phone = req.body.phone;
    const email = req.body.email;
    const memo = req.body.memo;

    let sql =`insert into contact(name,phone,email,memo,regdate) values (?,?,?,?,now())`

    let values = [name,phone,email,memo];

    connection.query(sql, values, function(err,result){
      if(err) throw err;
      console.log('자료 1개를 삽입하였습니다');
      res.send("<script> alert('문의사항이 등록되었습니다.'); location.href='/'; </script>");
    })
    // let a=`안녕하세요 ${name} ${phone} ${email} ${memo}`

    // res.send(a);
})



app.get('/contactList',(req,res) => {
  let sql = `select * from contact order by idx `
  connection.query(sql,function (err,results,fields){
    if(err) throw err;
    // console.log(results);
    res.render('contactList',{lists:results})
  })
})


app.get('/contactDelete', (req, res) => {
  let idx = req.query.idx
  let sql = `delete from contact where idx='${idx}'`
  connection.query(sql, function(err,results){
    if(err) throw err;
    res.send("<script> alert('삭제되었습니다.'); location.href='/contactList'; </script>");
  })

})


app.get('/login', (req, res) => {
  res.render('login')
})



app.post('/loginProc', (req, res) => {
  //get방식은 query 로 req.query.name , post는 body로
  const user_id = req.body.user_id;
  // const name = req.query.name;
  const pw = req.body.pw;

  let sql = `select * from member where user_id=? and pw=? `
  let values = [user_id,pw];

  connection.query(sql, values, function(err,result){
    if(err) throw err;

    // console.log(result.length);

    if(result.length ==0){
      res.send("<script> alert('존재하지 않는 아이디입니다.'); location.href='/login'; </script>");
    }else{
      console.log(result[0]);
      req.session.member =result[0]
      res.send("<script> alert('로그인 되었습니다..'); location.href='/'; </script>");
    }
    
  })
  // let a=`안녕하세요 ${name} ${phone} ${email} ${memo}`

  // res.send(a);
})





app.get('/logout', (req, res) => {
  req.session.member = null;
  res.send("<script> alert('로그아웃 되었습니다.'); location.href='/'; </script>");
})



app.listen(port, () => {
  console.log(`서버가 실행되었습니다. 접속주소: http://localhost: ${port}`)
})