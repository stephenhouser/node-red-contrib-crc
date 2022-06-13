/* crc-node.js - NodeRed node for checking and calculating CRC values
 *
 * 2022/06/13 Stephen Houser, MIT License
 * 
 * https://www.npmjs.com/package/crc
 * https://github.com/alexgorbatchev/node-crc
 */
const crc = require('crc');

module.exports = function(RED) {
	'use strict';

	function CRCNode(config) {
		RED.nodes.createNode(this, config);

		const node = this;
		node.name = config.name;
		node.algorithm = config.algorithm;
		node.mode = 'calculate'; // 'calculate' or 'validate'

		node.on('input', function(msg, send, done) {
			const algorithm = msg.algorithm ? msg.algorithm : node.algorithm;

			if (crc[algorithm] !== undefined) {
				const crc_function = crc[algorithm];
				const crc_computed = crc_function(msg.payload);

				if (node.mode === 'calculate') {
					msg[algorithm] = crc_computed;
					send(msg);
				} else if (node.mode === 'validate') {
					if (msg[algorithm] === crc_computed) {
						send(msg);						
					} else {	// drop message if CRC does not match.
						this.debug(`Message's CRC (${algorithm}) ${msg[algorithm]} does not match computed ${crc_computed}.`);
					}
				}
			} else {
				this.error('Invalid CRC algorithm selected.');
			}

			if (done) {
				done();
			}
		});
	}

	RED.nodes.registerType('crc', CRCNode);
};
