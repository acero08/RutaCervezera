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
  }
}, {
    timestamps: true
});

const UserDetail = mongoose.model('UserDetail', UserDetailSchema);
module.exports = Review;


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