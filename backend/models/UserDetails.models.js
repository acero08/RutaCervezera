const mongoose = require('mongoose');

const UserDetailSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  moblile: {
    type: String,
  },
  password: {
    type: String,
    required: true
  },
  image:{
    type:String
  },
  gender:{
    type:String
  },
  accountType:{
    type:String,
    enum: ['user', 'business', 'admin'],
    default: 'user'
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bar'
  }]
}, {
    timestamps: true
});

const UserDetail = mongoose.model('UserDetail', UserDetailSchema);
module.exports = UserDetail;


//{
 //  name: String,
//   email:{type: String, unique: True},
//    mobile: String,
//   password: String,
//},
//{
    //  collections:"UserInfo",
//}
//mongoose.model("UserInfo",UserDetailSchema),