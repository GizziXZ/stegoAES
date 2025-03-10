#!/usr/bin/env node
const { program } = require('commander');
const stego = require('./stego');
const path = require('path');

program
    .option('-s, --string [string]', 'A string argument')
    .option('-p, --password [password]', 'A password argument')
    .option('-o, --output [output]', 'An output argument')
    .argument('<file>', 'A file argument')
program.parse();

const string = program.opts().string;
const password = program.opts().password;
let output = program.opts().output;
const file = path.resolve(program.args[0]);

if (output) output = path.resolve(output);

if (string) {
    stego.hideSecretInFile(string, file, { password, output });
} else {
    stego.extractSecretFromFile(file, password);
}

// console.log(program.opts());