import {Injectable} from '@angular/core';
import CryptoJS from "crypto-js";
@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  secretKey = "It_is_the_key_you_don't_find_it_nBKnWuHskRrQH(@g";
  getKey():string {
    const date = new Date();
    const utc5Date = date.toISOString();
    return this.encrypt(utc5Date, this.secretKey);
  }
  encrypt(plainText: string, key: string): string {
    const iv = CryptoJS.lib.WordArray.random(16);
    const hashedKey = CryptoJS.SHA256(key).toString(CryptoJS.enc.Hex);
    const encrypted = CryptoJS.AES.encrypt(plainText, CryptoJS.enc.Hex.parse(hashedKey), {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    const encryptedMessage = iv.concat(encrypted.ciphertext);
    return CryptoJS.enc.Base64.stringify(encryptedMessage);
  }
}
