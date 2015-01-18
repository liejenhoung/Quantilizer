/**
* Strategy.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	
	attributes: {
		name: {
			type: 'string',
			required: true
		},
	
		author: {
			type: 'string',
			required: true
		},
	
		owner: {
			type: 'string',
			required: true
		},
		
		// Primary Key
		name_and_owner: {
			type: 'string',
			required: true,
			unique: true
		},
	
		code: {
			type: 'string',
			required: true
		},
		
		plotcode: {
			type: 'string'
		},
	
		description: {
			type: 'string'
		},
	
		onsale: {
			type: 'boolean',
			defaultsTo: false
		},
    
		price: {
			type: 'integer'
		},
		
		created: {
			type: 'string'
		},
		
		edited: {
			type: 'string'
		}
	}
};


