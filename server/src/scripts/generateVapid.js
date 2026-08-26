import crypto from 'node:crypto'
const {privateKey}=crypto.generateKeyPairSync('ec',{namedCurve:'prime256v1'})
const jwk=privateKey.export({format:'jwk'}),publicKey=Buffer.concat([Buffer.from([4]),Buffer.from(jwk.x,'base64url'),Buffer.from(jwk.y,'base64url')]).toString('base64url')
console.log(`WEB_PUSH_PUBLIC_KEY=${publicKey}`)
console.log(`WEB_PUSH_PRIVATE_KEY=${jwk.d}`)
console.log('Sao chép public key sang VITE_WEB_PUSH_PUBLIC_KEY của frontend.')
