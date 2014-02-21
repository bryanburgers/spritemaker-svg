"use strict";

var fs = require('fs');
var MemoryStream = require('memorystream');
var path = require('path');
var should = require('should');
var sprite = require('../index.js');

describe('spritemaker', function() {
	it('sprites two equally sized items (svg output)', function(done) {
		var expected = fs.readFileSync(__dirname + '/svg/test1/output.svg', 'utf-8');

		var files = [
			'svg/rect-10-blue.svg',
			'svg/rect-10-red.svg'
		];

		var files2 = files.map(function(item) {
			return {
				stream: fs.createReadStream(__dirname + '/' + item),
				id: path.basename(item, '.svg')
			};
		});

		var generated = MemoryStream.createWriteStream();

		var output = sprite(files2);

		output.pipe(generated);
		output.on('end', function() {
			generated.toString().should.eql(expected);
			done();
		});
	});

	it('sprites two equally sized items (packed event)', function(done) {
		var expected = fs.readFileSync(__dirname + '/svg/test1/output.svg', 'utf-8');

		var files = [
			'svg/rect-10-blue.svg',
			'svg/rect-10-red.svg'
		];

		var files2 = files.map(function(item) {
			return {
				stream: fs.createReadStream(__dirname + '/' + item),
				id: path.basename(item, '.svg')
			};
		});

		var generated = MemoryStream.createWriteStream();

		var output = sprite(files2);
		output.on('packed', function(data) {
			data.width.should.eql(20);
			data.height.should.eql(10);
			data.items.should.have.property('length')
			data.items[0].should.eql({
				id: 'rect-10-blue',
				x: 0,
				y: 0,
				width: 10,
				height: 10
			});
			data.items[1].should.eql({
				id: 'rect-10-red',
				x: 10,
				y: 0,
				width: 10,
				height: 10
			});
			done();
		});
	});
});
