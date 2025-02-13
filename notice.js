
const mongoose = require ("mongoose");

const noticeSchema =  new mongoose.Schema ({
  title: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return isNaN(v);
      },
    
    }
    
  }, 
  description:{
    type : String,
    required: true,
    validate: {
      validator: function(v) {
        return isNaN(v);
      },
     
    }
    
  },
  date: {
    type:Date, 
    default:Date.now

  },
  fileUrl :{
    type : String
  }

})

const Notice =  mongoose.model("Notice", noticeSchema)
module.exports = Notice;