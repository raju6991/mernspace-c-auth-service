import crypto from 'node:crypto'

import fs from 'node:fs'

const { privateKey, publicKey } = crypto.generateKeyPairSync(`rsa`, {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
    },

    privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
    },
})

console.log('public Key', publicKey)
console.log('Private Key', privateKey)

fs.writeFileSync('certs/private.pem', privateKey)
fs.writeFileSync('certs/public.pem', publicKey)
