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
  // Bares gestionados por el usuario business
  managedBars: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bar'
  }],
  // Permisos específicos para diferentes tipos de usuarios
  permissions: {
    canCreateBars: {
      type: Boolean,
      default: function () {
        return this.accountType === 'admin' || this.accountType === 'business';
      }
    },
    canManageAllBars: {
      type: Boolean,
      default: function () {
        return this.accountType === 'admin';
      }
    },
    canManageUsers: {
      type: Boolean,
      default: function () {
        return this.accountType === 'admin';
      }
    },
    // Nuevos permisos específicos para business
    canManageMenu: {
      type: Boolean,
      default: function () {
        return this.accountType === 'admin' || this.accountType === 'business';
      }
    },
    canManageEvents: {
      type: Boolean,
      default: function () {
        return this.accountType === 'admin' || this.accountType === 'business';
      }
    },
    canManagePhotos: {
      type: Boolean,
      default: function () {
        return this.accountType === 'admin' || this.accountType === 'business';
      }
    }
  },
  // Información adicional para cuentas business
  businessInfo: {
    businessName: String,
    businessDescription: String,
    businessLicense: String,
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    verificationDate: Date
  }
}, {
  timestamps: true
});

// Método para verificar si el usuario puede gestionar un bar específico
UserDetailSchema.methods.canManageBar = function (barId) {
  return this.accountType === 'admin' ||
    this.managedBars.includes(barId);
};

// Método para verificar permisos específicos
UserDetailSchema.methods.hasPermission = function (permission) {
  return this.permissions[permission] === true;
};

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