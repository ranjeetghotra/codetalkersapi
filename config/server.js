const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/codetalkers', { useNewUrlParser: true, useUnifiedTopology: true},(err)=>{
    if(err){ console.log('Error in DB connection : '+err) }
    else { console.log('connection successful') }
})