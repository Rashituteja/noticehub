const joi = require('joi');

module.exports.noticeSchema = joi.object({
    notice: joi.object({
        title:joi.string().required(),
        description:joi.string().required(),
   
     
    }).required()
})
