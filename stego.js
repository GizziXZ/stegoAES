const fs = require('fs');
const crypto = require('crypto');
const { PNG } = require('pngjs');
const delimiter = '1111111100000000';

function hideSecretInFile(secret, file, options) {
    let secretBinary = toBinary(secret);
    const fileSize = fs.statSync(file).size; // file size in bytes
    const secretSize = secretBinary.length / 8; // secret size in bytes
    
    if (secretSize > fileSize) {
        console.error('Secret is too large to hide in the file');
        return;
    }
    
    if (options.password) { // encrypt the secret with aes256 if a password is provided
        const key = crypto.pbkdf2Sync(options.password, 'salt', 1, 256 / 8, 'sha512'); // generate a key from the password
        const iv = crypto.createHash('sha256').update(options.password).digest().slice(0, 16); // generate an iv from the password
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv); // create a cipher using the key and iv
        const encryptedSecret = Buffer.concat([cipher.update(secretBinary), cipher.final()]); // encrypt the secret
        secretBinary = toBinary(encryptedSecret.toString('hex')) + delimiter; // convert the encrypted secret to a hex string
        // console.log(encryptedSecret.toString('hex'));
    }

    let newFile;

    if (options.output) {
        newFile = options.output;
    } else {
        newFile = file;
    }
    
    if (file.endsWith('.png')) {
        fs.createReadStream(file).pipe(new PNG()).on('parsed', function() {
            let index = 0;
            for (let i = 0; i < secretBinary.length; i++) {
                this.data[index] = (this.data[index] & 0xFE) | parseInt(secretBinary[i]); // set the least significant bit of the byte to the next bit of the secret
                index++;
            }

            this.pack().pipe(fs.createWriteStream(newFile)).on('finish', () => {
                console.log('Secret hidden in file');
            });
        });
    }
}

function extractSecretFromFile(file, password) {
    if (file.endsWith('.png')) {
        fs.createReadStream(file).pipe(new PNG()).on('parsed', function() {
            let secret = '';
            for (let i = 0; i < this.data.length; i++) {
                secret += (this.data[i] & 1); // get the least significant bit of the byte
                if (secret.endsWith(delimiter)) {
                    secret = secret.slice(0, -delimiter.length); // remove the delimiter from the secret
                    if (password) { // decrypt the secret with aes256 if a password is provided
                        try {
                            const key = crypto.pbkdf2Sync(password, 'salt', 1, 256 / 8, 'sha512');
                            const iv = crypto.createHash('sha256').update(password).digest().slice(0, 16);
                            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv); // create a decipher using the key and iv
                            secret = fromBinary(secret); // convert the binary to text
                            secret = Buffer.from(secret, 'hex'); // convert the hex string to a buffer
                            secret = Buffer.concat([decipher.update(secret), decipher.final()]).toString(); // decrypt the secret
                        } catch (error) {
                            if (error.message == 'error:1C800064:Provider routines::bad decrypt') {
                                return console.error('Incorrect password, could not decrypt');
                            }
                        }
                    }
                    console.log(fromBinary(secret)); // convert the binary to text
                    break;
                } else if (i == this.data.length - 1) {
                    console.log('No secret found in file');
                    break;
                }
            }
        });
    }
}

function toBinary(text) {
    return text.split('').map(char => { // for each character in the text
        return char.charCodeAt(0).toString(2).padStart(8, '0'); // convert the character to it's binary
    }).join(''); // join all the binary characters together
}

function fromBinary(binary) {
    return binary.match(/.{8}/g).map(byte => String.fromCharCode(parseInt(byte, 2))).join(''); // convert the binary to text
}

module.exports = {
    hideSecretInFile,
    extractSecretFromFile
};