"use strict";

var async = require('async');
var pack = require('bin-pack');
var Transform = require('stream').Transform;
var util = require('util');
var xml2js = require('xml2js');

util.inherits(SpritemakerStream, Transform);
function SpritemakerStream(options) {
	Transform.call(this, options);
}
SpritemakerStream.prototype._transform = function(chunk, encoding, done) {
	this.push(chunk);
	done();
};

SpritemakerStream.prototype._readToEnd = function(stream, cb) {
	var data = '';
	stream.setEncoding('utf-8');
	stream.on('data', function(chunk) {
		data += chunk;
	});
	stream.on('end', function() {
		cb(null, data);
	});
};

SpritemakerStream.prototype._getDimensions = function(sprite, cb) {
	this._readToEnd(sprite.stream, function(err, content) {
		if (err) {
			return cb(err);
		}

		var parser = new xml2js.Parser();

		parser.parseString(content, function (err, result) {
			var width = parseInt(result.svg['$'].width, 10);
			var height = parseInt(result.svg['$'].height, 10);

			var item = {
				id: sprite.id,
				width: width,
				height: height,
				content: result
			};

			cb(null, item);
		});
	});
};

SpritemakerStream.prototype._output = function(result) {
	result.content.svg['$'].x = result.x;
	result.content.svg['$'].y = result.y;
	result.content.svg['$']['spritemaker:name'] = result.id;
	var builder = new xml2js.Builder();
	var xml = builder.buildObject(result.content);
	// xml2js.Builder doesn't seem to support outputting without the
	// XML declaration.
	// https://github.com/Leonidas-from-XIV/node-xml2js/issues/109
	xml = xml.replace(/<\?xml.*\?>(\r?\n)*/, '');
	this.write(xml);
	this.write('\n');
};

SpritemakerStream.prototype.sprite = function(sprites, options) {
	var self = this;

	async.map(sprites, function(sprite, cb) {
		self._getDimensions(sprite, cb);
	},
	function (err, results) {
		var result = pack(results, { inPlace: true });
		result.items = results.map(function(item) {
			return {
				id: item.id,
				x: item.x,
				y: item.y,
				width: item.width,
				height: item.height
			}
		});

		self.emit('packed', result);

		self.write('<svg xmlns="http://www.w3.org/2000/svg" xmlns:spritemaker="tag:burgers.io,2014:spritemaker" width="' + result.width + '" height="' + result.height + '">\n');

		results.forEach(function(result) {
			self._output(result);
		});

		self.write('</svg>\n');
		self.end();
	});
};

module.exports = function(sprites, options) {
	var stream = new SpritemakerStream();
	stream.sprite(sprites, options);
	return stream;
};
module.exports.Stream = SpritemakerStream;
