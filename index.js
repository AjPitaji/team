require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require('mongoose');
const app = express();
const{Schema,model}=mongoose;
const bodyParser = require("body-parser");

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.mongoSt);

const MemberSchema = new Schema(
  {
    Name: String,
    Description:String,
    Tech_Stack:[String],
    Year_of_Study:String,
    g:String,
  }
)

const MemberModel = new model("member",MemberSchema)

//performing Read Operation
app.get("/",async(req,res)=>{
   
   list=[]
   const result= await MemberModel.find()
    result.forEach(element => {
      var image = 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg'
      if(element.g=="f"){
        image = "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436180.jpg"
      }
      list.push({name:element.Name,des:element.Description,tks:element.Tech_Stack,yos:element.Year_of_Study,img:image})
    });
   res.render("home.ejs",{list:list})
});
app.get("/mem-json",async(req,res)=>{
   

    const result= await MemberModel.find()
    res.send(result)

})
//Read operation performed


//performing create operation
app.route("/AddMember")
.get(async(req,res)=>{
  res.render("AddMember.ejs")
})
.post(function(req,res){

  member = new MemberModel({
    Name: req.body.name,
    Description:req.body.bio,
    Tech_Stack:[req.body.skill1,req.body.skill2,req.body.skill3],
    Year_of_Study:req.body.yos,
    g:req.body.gender,
  })
  member.save()
  res.redirect("/")
})
//create operation performed


//performing Delete operation 
app.route("/RemoveMember")
.get(async(req,res)=>{
  res.render("RemoveMember.ejs")
})
.post(async function(req,res){
  try {
    const result = await MemberModel.deleteOne({ Name:req.body.name})
    console.log(result)
    res.redirect("/")
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})
//Delete operation performed


//performing Update operation
app.route("/UpdateMember")
.get(async(req,res)=>{
  res.render("Update.ejs")
})
.post(async function(req,res){
  try {
    const result = await MemberModel.updateOne(
      { Name: req.body.oname },
      { $set: { Name: req.body.fname } }
    );
    console.log(result);
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
})
//Update operation performed

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.mongoSt, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

connectDB().then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${process.env.PORT || 3000}`);
  });
});

module.exports = app;
