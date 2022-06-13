/* crc-node.js - NodeRed node for checking and calculating CRC values
 *
 * 2022/06/13 Stephen Houser, MIT License
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
			if (crc[node.algorithm] !== undefined) {
				const crc_function = crc[node.algorithm];
				const crc_computed = crc_function(msg.payload);

				if (node.mode === 'calculate') {
					msg[node.algorithm] = crc_computed;
					send(msg);
				} else if (node.mode === 'validate') {
					if (msg[node.algorithm] === crc_computed) {
						send(msg);						
					} else {	// drop message if CRC does not match.
						this.debug(`Message's CRC (${node.algorithm}) ${msg[node.algorithm]} does not match computed ${crc_computed}.`);
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
