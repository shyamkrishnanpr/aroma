const mongoose = require('mongoose');
const banner = require('../model/bannerSchema');



// Render the banner management page
const bannerPage = async (req, res, next) => {
  try {
    const bannerData = await banner.find().sort({ order: 1 });
    res.render('admin/banner', { bannerData });
  } catch (error) {
    console.log(error);
  }
};

// Add a new banner
const addBanner = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const maxOrderBanner = await banner.findOne().sort({ order: -1 });
    const newBannerOrder = maxOrderBanner ? maxOrderBanner.order + 1 : 1;

    await banner.create({
      offerType: req.body.offerType,
      bannerText: req.body.bannerText,
      couponName: req.body.couponName,
      bannerImage: req.file.filename,
      order: newBannerOrder
    });

    res.redirect('/admin/banner');
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to add banner' });
  }
};

// Update the order of banners
const updateOrder = async (req, res, next) => {
    try {
      const mongoose = require('mongoose');
  
      const bannerIds = Object.keys(req.body)
        .filter(key => /bannerId/.test(key))
        .map(key => new mongoose.Types.ObjectId(req.body[key]));
  
      const orderValues = Object.keys(req.body)
        .filter(key => /^order/.test(key))
        .map(key => Number(req.body[key]));
  
      const duplicateOrders = orderValues.filter(
        (value, index, self) => self.indexOf(value) !== index
      );
      if (duplicateOrders.length > 0) {
        return res.status(400).json({
          error: 'Cannot set the same order number for multiple banners',
        });
      }
  
      const invalidOrders = orderValues.filter(value => value < 1);
      if (invalidOrders.length > 0) {
        res.json({ banner: true });
      } 
  
      const existingBanner = await banner.findOne({ order: orderValues[0] });
      if (existingBanner) {
        const existingBannerId = existingBanner._id.toString();
        const existingBannerOrder = existingBanner.order;
        if (existingBannerId !== bannerIds[0].toString()) {
          const bannerToUpdate = await banner.findOne({ _id: bannerIds[0] });
          const bannerToUpdateOrder = bannerToUpdate.order;
          await banner.findOneAndUpdate(
            { _id: bannerIds[0] }, 
            { order: existingBannerOrder },
            { new: true }
          );
          await banner.findOneAndUpdate(
            { _id: existingBannerId },
            { order: bannerToUpdateOrder },
            { new: true }
          );
          return res.redirect('/admin/banner');
        }
      }
  
      const updatePromises = bannerIds.map((bannerId, index) => {
        return banner.findOneAndUpdate(
          { _id: bannerId },
          { order: orderValues[index] },
          { new: true }
        );
      });
      const updatedBanners = await Promise.all(updatePromises);
  
      res.redirect('/admin/banner');
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to update banner order' });
    }
  };
  
  


  const editBanner = async(req,res,next)=>{
    try {
        const id = req.params.id;
        await banner.updateOne({_id:id},{
            offerType: req.body.offerType,
            bannerText: req.body.bannerText,
            couponName: req.body.couponName
        }).then(()=>{
            res.redirect('/admin/banner')
        })


        
    } catch (error) {
        console.log(error)
    }
  };

  const blockBanner = async(req,res,next)=>{
    try {

// console.log("bannerblocked")

        const id = req.params.id;
        await banner.updateOne({_id:id},{
            $set:{blocked:true}
        }).then(()=>{
            res.redirect('/admin/banner')
        })
    } catch (error) {
        console.log(error)
    }
  };

  const unblockBanner = async(req,res,next)=>{
    try {
        const id = req.params.id;
        await banner.updateOne({_id:id},{
            $set:{blocked:false}
        }).then(()=>{
            res.redirect('/admin/banner')
        })
        
    } catch (error) {
        console.log(error)
    }
  };
  



module.exports = {
    bannerPage,
    addBanner,
    editBanner,
    blockBanner,
    unblockBanner,
    updateOrder

}