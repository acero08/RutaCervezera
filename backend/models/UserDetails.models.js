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
  mobile: {
    type: String,
  },
  password: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  gender: {
    type: String
  },
  accountType: {
    type: String,
    enum: ['user', 'business', 'admin'],
    default: 'user'
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bar'
  }],
  // NUEVO: Para admins que pueden crear bares
  managedBars: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bar'
  }],
  // NUEVO: Permisos específicos para diferentes tipos de admin
  permissions: {
    canCreateBars: {
      type: Boolean,
      default: function() {
        return this.accountType === 'admin' || this.accountType === 'business';
      }
    },
    canManageAllBars: {
      type: Boolean,
      default: function() {
        return this.accountType === 'admin';
      }
    },
    canManageUsers: {
      type: Boolean,
      default: function() {
        return this.accountType === 'admin';
      }
    }
  }
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