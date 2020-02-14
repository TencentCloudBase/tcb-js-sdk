// function
import { register } from './util';

const readFile = async function(file) {
  let reader = new FileReader();

  let res = await new Promise(resolve => {
    reader.onload = function(e) {
      let arrayBuffer = new Uint8Array((e.target as any).result);
      resolve(arrayBuffer);
    };

    reader.readAsArrayBuffer(file);
  });

  return res;

};

export function test_ext_ci(app) {

  register('ci put', async () => {
    const ops = {
      rules: [{
        rule: 'QRcode/cover/0'
      }]
    };

    let file = (<HTMLInputElement>document.getElementById('selectFile')).files[0];

    let fileContent = await readFile(file);

    const res = await app.invokeExtension('CloudInfinite', {
      cloudPath: 'qr6.jpg',
      fileContent,
      headers: {
        'Pic-Operations': JSON.stringify(ops)
      },
      method: 'PUT'
    });

    console.log(JSON.stringify(res, null, 4));
  });

  register('ci get', async () => {
    const res = await app.invokeExtension('CloudInfinite', {
      cloudPath: 'nv.jpg',
      // fileContent: fs.readFileSync('C:\\Users\\张国彬\\Desktop\\bb.png'),
      query: {
        'ci-process': 'sensitive-content-recognition',
        'detect-type': 'porn,ads'
      },
      method: 'GET'
    });

    console.log(JSON.stringify(res, null, 4));
  });
}