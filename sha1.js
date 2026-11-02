function rotl(x, n) {
  return ((x << n) | (x >>> (32 - n))) >>> 0;
}
function padding (mensagem) {
  const bytes = Buffer.isBuffer(mensagem) ? mensagem : Buffer.from(mensagem, 'utf8');
  const tamBits = bytes.length *8;
  const totalBytes = Math.ceil((bytes.length + 9) / 64) * 64; // conta os blocos de 64bytes (regra: mensagem + 0x80 + zeros + 8 bytes de tamanho)

  const dados = Buffer.alloc(totalBytes); // já vem tudo zerado
  bytes.copy(dados, 0);
  dados[bytes.length] = 0x80; // o bit "1" seguido de sete zeros
  // agr escrever o tamBits inicial no final do bloco:
  // divide o numero em 2 partes para usar as op bit-a-bit
  dados.writeUInt32BE(Math.floor(tamBits / 2 ** 32), totalBytes - 8); // primeira parte do int (apenas maior que 2^32)
  dados.writeUInt32BE(tamBits >>> 0, totalBytes - 4); // segunda parte do int (resto)
  return dados;
}

export function sha1 (mensagem){
  const dados = padding(mensagem);
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  // processar cada bloco de 64bits:
  for (let ini = 0; ini < dados.length; ini += 64){
    const w = new Array(80);
    for (let i = 0; i < 16; i++){
      w[i] = dados.readUInt32BE(ini + i*4); //transforma 4 bytes num Number
    }
    for (let i = 16; i < 80; i++) {
      w[i] = rotl(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let i = 0; i < 80; i++) {
      let f, k;
      if (i < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (i < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (i < 60) {
        f = (b&c) | (b&d) | (c&d);
        k = 0x8F1BBCDC;
      } else {
        f = b ^ c ^ d;
        k = 0xCA62C1D6;
      }

      const temp = (rotl(a, 5) + (f >>> 0) + e + k + w[i]) >>> 0;
      e = d;
      d = c;
      c = rotl(b, 30);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }
  return [h0, h1, h2, h3, h4]
    .map((h) => h.toString(16).padStart(8, '0'))
    .join('');
}
