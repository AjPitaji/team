require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require('mongoose');
const app = express();
const{Schema,model}=mongoose;
const bodyParser = require("body-parser");
const axios = require('axios');

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.mongoSt);
let last_id = 13;

async function getAnimalImage(animal) {
  const accessKey = process.env.accessKey;
  const response = await axios.get(`https://api.pexels.com/v1/search?query=${animal}`, {
    headers: {
      Authorization: accessKey
    }
  });
  const images = response.data.photos;
  if (images.length === 0) {
    throw new Error(`No images found for ${animal}`);
  }
  const imageUrl = images[Math.floor(Math.random() * images.length)].src.large2x;

  return imageUrl;
}


  const PetSchema = new Schema(
    {

        name: String,
        owner_name: String,
        age: String,
        type: String,
        gender: String,
        description: String,
        image: {
          type: String,
          default: ''
        },
        pid:String,
    }
  )
  
const PetModel = new model("Name",PetSchema)

//performing Read Operation

app.get("/", async (req, res) => {
  let list = [];
  const result = await PetModel.find();
  for (const element of result) {
    let imageUrl = element.image;
    if (!imageUrl) 
    {
      try {
        imageUrl = await getAnimalImage(element.type);
        await PetModel.updateOne({ pid: element.pid }, { $set: { image: imageUrl } });
      } catch (error) {
        console.error(error);
      }
    }
    list.push({
      id:element.pid,
      name: element.name,
      des: element.description,
      owner: element.owner_name,
      age: element.age,
      type: element.type,
      gender:element.gender,
      img: imageUrl,
    });
  }
  res.render("home.ejs", { list: list });
});

//Read operation performed


//performing create operation
app.route("/AddMember")
.get(async(req,res)=>{
  res.render("AddMember.ejs")
})
.post(async function(req,res){
  const newPet = new PetModel({
    name: req.body.name,
    owner_name: req.body.owner,
    age: req.body.age,
    type:req.body.type,
    gender:req.body.gender,
    description:req.body.des,
    image:req.body.img,
    pid:((req.body.name).charAt(0)+(req.body.owner).charAt(0)+(req.body.age).charAt(0)+(req.body.type).charAt(0)).toUpperCase(),
    
  })
  await newPet.save()
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
    const result = await PetModel.deleteOne({ pid:(req.body.pid).toUpperCase()})
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
  let pid = req.body.pid.toUpperCase()
  let field = req.body.field
  try {
    if(field==="type"){
      imageUrl = await getAnimalImage(req.body.new_value);
      const result = await PetModel.updateOne(
        { pid: pid },
        { $set: { image: imageUrl } }
      );
    }
    const result = await PetModel.updateOne(
      { pid: pid },
      { $set: { [field]: req.body.new_value} }
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
