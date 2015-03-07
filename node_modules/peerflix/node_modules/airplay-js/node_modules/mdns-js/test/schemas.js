var Joi = require('joi');

exports.type = Joi.object({
	name: Joi.string().required(),
	protocol: Joi.string(),
	subtypes: Joi.array(),
	description: Joi.string()
});

exports.question = {
	type: Joi.array().includes(exports.type),
	port: Joi.number().integer().optional(),
	fullname: Joi.string().optional(),
	host: Joi.string().optional(),
	txt: Joi.array()
};

exports.answer = {
	type: Joi.array().includes(exports.type),
	host: Joi.string(),
	port: Joi.number().integer(),
	fullname: Joi.string(),
	txt: Joi.array()
};

exports.additional = {
	type: Joi.array().includes(exports.type),
	port: Joi.number().integer(),
	fullname: Joi.string(),
	txt: Joi.array(),
	host: Joi.string()
};

exports.authority = {
	type: Joi.array().includes(exports.type)
};


exports.validate = Joi.validate;
