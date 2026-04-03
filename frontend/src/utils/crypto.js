import forge from "node-forge";
import CryptoJS from "crypto-js";

export function generateKeyPair() {
  const rsa = forge.pki.rsa;
  const keypair = rsa.generateKeyPair({ bits: 2048, e: 0x10001 });

  const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
  const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

  return {
    publicKey: publicKeyPem,
    privateKey: privateKeyPem,
  };
}

export function generateSalt() {
  return forge.random.getBytesSync(16);
}

export function generateIV() {
  return forge.random.getBytesSync(16);
}

export function hashPassword(password, salt) {
  const key = forge.pkcs5.pbkdf2(password, salt, 10000, 32);
  return forge.util.encode64(key);
}

export function encryptPrivateKey(privateKey, password, salt, iv) {
  const key = forge.pkcs5.pbkdf2(password, salt, 10000, 32);
  const cipher = forge.cipher.createCipher("AES-CBC", key);

  cipher.start({ iv: iv });
  cipher.update(forge.util.createBuffer(privateKey));
  cipher.finish();

  return forge.util.encode64(cipher.output.data);
}

export function decryptPrivateKey(encryptedPrivateKey, password, saltHex, ivHex) {
  try {
    const salt = forge.util.hexToBytes(saltHex);
    const iv = forge.util.hexToBytes(ivHex);

    const key = forge.pkcs5.pbkdf2(password, salt, 10000, 32);

    const decipher = forge.cipher.createDecipher("AES-CBC", key);
    decipher.start({ iv: iv });
    decipher.update(
      forge.util.createBuffer(forge.util.decode64(encryptedPrivateKey))
    );

    const pass = decipher.finish();

    if (!pass) {
      throw new Error("Decryption failed: wrong password or corrupted key data");
    }

    const decryptedData = decipher.output.bytes();

    if (!decryptedData || !decryptedData.includes("-----BEGIN")) {
      throw new Error("Decrypted output is not a valid PEM key");
    }

    return decryptedData;
  } catch (error) {
    throw new Error("Failed to decrypt private key: " + error.message);
  }
}

export function generateSharedSecret(privateKeyPem, publicKeyPem) {
  try {
    if (!privateKeyPem || !publicKeyPem) {
      throw new Error("Missing private or public key");
    }

    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    forge.pki.publicKeyFromPem(publicKeyPem);

    const myPublicKey = forge.pki.rsa.setPublicKey(privateKey.n, privateKey.e);
    const myPublicKeyPem = forge.pki.publicKeyToPem(myPublicKey);

    let key1, key2;
    if (myPublicKeyPem < publicKeyPem) {
      key1 = myPublicKeyPem;
      key2 = publicKeyPem;
    } else {
      key1 = publicKeyPem;
      key2 = myPublicKeyPem;
    }

    const combined = key1 + key2;
    const hash = forge.md.sha256.create();
    hash.update(combined);

    return hash.digest().toHex().substring(0, 32);
  } catch (error) {
    throw new Error("Failed to generate shared secret: " + error.message);
  }
}

export function encryptMessage(message, sharedSecret, iv) {
  const key = CryptoJS.enc.Hex.parse(sharedSecret);
  const ivWordArray = CryptoJS.enc.Utf8.parse(iv);

  const encrypted = CryptoJS.AES.encrypt(message, key, {
    iv: ivWordArray,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString();
}

export function decryptMessage(ciphertext, sharedSecret, iv) {
  try {
    const key = CryptoJS.enc.Hex.parse(sharedSecret);
    const ivWordArray = CryptoJS.enc.Utf8.parse(iv);

    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
      iv: ivWordArray,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const result = decrypted.toString(CryptoJS.enc.Utf8);
    return result;
  } catch (error) {
    return "[Decryption failed: " + error.message + "]";
  }
}

export function stringToHex(str) {
  return forge.util.bytesToHex(str);
}

export function hexToString(hex) {
  return forge.util.hexToBytes(hex);
}