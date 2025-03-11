# stegoAES

A command-line interface (CLI) tool for performing steganography operations, such as hiding and extracting AES encrypted messages within images.

## Features

- Hide encrypted messages within images
- Extract hidden messages from images
- As of now, it only supports PNG file types

## Installation

To install the Steganography CLI tool, clone the repository and install the dependencies:

```bash
npm i -g stegoaes
```

## Usage

### Hiding a Message

To hide a message within an image, use the following command:

```bash
stegoaes -s <your message> -p <optional password> <file> -o <optional output file>
```

Your secret will automatically be encrypted with AES256 if a password is provided

### Extracting a Message

To extract a hidden message from an image, use the following command:

```bash
stegoaes -p <optional password> <file>
```
