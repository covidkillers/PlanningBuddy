	let completelist = "";
    let progresslist = "";
	Item.find({status:"Completed"},function(err,foundItems)
	{
		completelist = foundItems;
		console.log(completelist);
	});

	Item.find({status:"In Progress"},function(err,foundItems)
	{
		progresslist = foundItems;
		console.log(progresslist);
	});

	Item.find({status:"New"},function(err,foundItems)
	{
		//console.log(foundItems);
		res.render("index",{newListItems:foundItems , oldListItems:completelist , proListItems:progresslist});
		//res.render("index",{});
	});



 			



 





    app.post("/delete",function(req,res)
{
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId,function(err)
  {
    if(!err)
    {
    	//console.log("Deleted Successfully!!!");
    	res.redirect("/");
    }
  });
});



