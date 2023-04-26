const mongoose=require("mongoose");

const userSchema= new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        
    },
    phonenumber:{
        type:String,
        required:true,
        
    },
    password:{
        type:String,
        required:true,
        
    },
    is_admin:{
        type:Number,
        
    },
    verified:{
        type:Boolean,
        default:false
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    walletTotal:{
        type:Number,
        default:0

    },
   
    addressDetail:[
        {
            phonenumber:{
                type:Number   
            },
            housename:{
                type:String
            },
            postoffice:{
                type:String
            },
            area:{
                type:String
            },
            district:{
                type:String
            },
            state:{
                type:String
            },
            pin:{
                type:String
            },
           
        }
    ]


    // otp:{
    //     type:String,
    //     required:true,
    // },
    
    
})
 


const User = mongoose.model("User",userSchema);
module.exports = User