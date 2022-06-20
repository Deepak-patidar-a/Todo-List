//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//For database connection
mongoose.connect("mongodb+srv://admin-deepak:saguRAVI123@cluster0.7kovv.mongodb.net/todolistDB", {useNewUrlParser: true});

//Creating Schema
const itemsSchema =({
  item: String
});

//Creating Mongoose model
const Item = mongoose.model("Item", itemsSchema);

//Creating new document
const item1 = new Item({
  item: "Welcome to your todolist!"
});

const item2 = new Item({
  item: "Hit the + button to add a new item."
});

const item3 = new Item({
  item: "<-- Hit this to delete an item"
});

const defaultItmes = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

//Mongoose insertMany()
/*Item.insertMany(defaultItmes,function(err){
  if(err){
    console.log(err);
  }else{
    console.log("Insertion Successful")
  }
});*/

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if(foundItems.length ===0){
      Item.insertMany(defaultItmes,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Insertion Successful")
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today" , newListItems:foundItems});

    }
  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
       item: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");

  }else{
    List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
    });
  }
  
  

});

app.post("/delete", function(req,res){
   const checkedItemId = req.body.checkbox;

   const listNameWhenDeleting= req.body.listNameWhenDeleting;

   if(listNameWhenDeleting === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Deleted successfully");
        res.redirect("/");
      }
    });

   }else{
     List.findOneAndUpdate({name: listNameWhenDeleting},
      {$pull: {items: {_id: checkedItemId}}},
      function(err,foundList){
        if(!err){
          res.redirect("/" + listNameWhenDeleting);
        }
      });
   }

   
});

/*app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});*/

//Dynamic route using Express
app.get("/:customListName", function(req,res){
     const customListName = _.capitalize(req.params.customListName);

     List.findOne({name:customListName}, function(err,foundList){
       if(!err){
         if(!foundList){
           //console.log("Doesn't exists")
           //Create New llist
           const list = new List({
            name : customListName,
            items: defaultItmes
          });
     
          list.save();
          res.redirect("/" + customListName);
         }else{
           //console.log("Exists");
           //show existing list
           res.render("list", {listTitle: foundList.name , newListItems: foundList.items});
         }
       }
     })

     
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
